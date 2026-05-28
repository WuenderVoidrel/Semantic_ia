import type { Metric } from "@prisma/client";

import { calculateConfidence } from "../../shared/utils/calculate-confidence.js";
import { normalizeText } from "../../shared/utils/normalize-text.js";

import type { GenerateSemanticPlanBody } from "./semantic.schema.js";
import { SemanticRepository } from "./semantic.repository.js";

type MetricWithDomain = Metric & {
  domain: {
    id: string;
    slug: string;
    name: string;
  };
};

type Period = {
  raw: string;
  type: "relative" | "business_period";
  value: string;
} | null;

type GroupByValue = "shift" | "day" | "month" | "farm" | "front" | "equipment";

const PERIOD_RULES = [
  { keys: ["mes atual", "mês atual"], period: { raw: "mes atual", type: "relative" as const, value: "current_month" } },
  { keys: ["hoje"], period: { raw: "hoje", type: "relative" as const, value: "today" } },
  { keys: ["ontem"], period: { raw: "ontem", type: "relative" as const, value: "yesterday" } },
  { keys: ["semana"], period: { raw: "semana", type: "relative" as const, value: "current_week" } },
  { keys: ["safra"], period: { raw: "safra", type: "business_period" as const, value: "harvest" } }
];

const GROUP_BY_RULES: Array<{ keys: string[]; value: GroupByValue }> = [
  { keys: ["turno", "turnos"], value: "shift" },
  { keys: ["dia", "dias"], value: "day" },
  { keys: ["mes", "mês", "mensal"], value: "month" },
  { keys: ["fazenda", "fazendas"], value: "farm" },
  { keys: ["frente", "frentes"], value: "front" },
  { keys: ["equipamento", "equipamentos"], value: "equipment" }
];

function getSynonyms(rawSynonyms: unknown) {
  return Array.isArray(rawSynonyms) ? rawSynonyms.filter((value): value is string => typeof value === "string") : [];
}

function detectPeriod(input: string): Period {
  const match = PERIOD_RULES.find((rule) => rule.keys.some((key) => input.includes(normalizeText(key))));
  return match?.period ?? null;
}

function detectGroupBy(input: string) {
  return GROUP_BY_RULES.filter((rule) => rule.keys.some((key) => input.includes(normalizeText(key)))).map((rule) => rule.value);
}

function detectSuggestedSkills(input: string, hasMetric: boolean, hasPeriod: boolean, groupBy: GroupByValue[]) {
  const normalizedInput = normalizeText(input);
  const skills = new Set<string>();

  if (hasMetric) {
    skills.add("metric-resolver");
    skills.add("answer-verifier");
  }

  if (hasPeriod) {
    skills.add("ranges-relativos");
  }

  if (groupBy.includes("shift")) {
    skills.add("turnos-rules");
  }

  if (["grafico", "gráfico", "visualizar", "tendencia", "tendência"].some((term) => normalizedInput.includes(normalizeText(term)))) {
    skills.add("chart-recommendation");
  }

  if (["atualizado", "atualizacao", "atualização", "defasagem"].some((term) => normalizedInput.includes(normalizeText(term)))) {
    skills.add("data-freshness");
  }

  return Array.from(skills);
}

function buildExplanation(metricName: string | null, period: Period, groupBy: GroupByValue[], needsClarification: boolean) {
  if (needsClarification) {
    return "A pergunta ainda precisa de mais contexto para identificar a metrica com seguranca.";
  }

  const fragments = [`A pergunta indica consulta da metrica ${metricName}`];

  if (period) {
    fragments.push(`com periodo ${period.raw}`);
  }

  if (groupBy.length > 0) {
    fragments.push(`e agrupamento por ${groupBy.join(", ")}`);
  }

  return `${fragments.join(" ")}.`;
}

export class SemanticService {
  constructor(private readonly semanticRepository: SemanticRepository) {}

  async generatePlan(data: GenerateSemanticPlanBody) {
    const input = data.input.trim();
    const normalizedInput = normalizeText(input);
    const metrics = await this.semanticRepository.getActiveMetricsWithDomain();

    let selectedMetric: MetricWithDomain | null = null;
    let bestScore = 0;
    let exactSynonymMatch = false;
    let metricNameMatch = false;
    let domainDetected = false;

    for (const metric of metrics) {
      const normalizedMetricName = normalizeText(metric.name);
      const normalizedDomainName = normalizeText(metric.domain.name);
      const normalizedDomainSlug = normalizeText(metric.domain.slug);
      const normalizedSynonyms = getSynonyms(metric.synonyms).map((synonym) => normalizeText(synonym));

      let currentScore = 0;
      const currentExactSynonymMatch = normalizedSynonyms.some((synonym) => normalizedInput.includes(synonym));
      const currentMetricNameMatch = normalizedInput.includes(normalizedMetricName);
      const currentDomainDetected =
        normalizedInput.includes(normalizedDomainName) || normalizedInput.includes(normalizedDomainSlug);

      if (currentExactSynonymMatch) {
        currentScore += 0.5;
      }

      if (currentMetricNameMatch) {
        currentScore += 0.3;
      }

      if (currentDomainDetected) {
        currentScore += 0.1;
      }

      if (currentScore > bestScore) {
        bestScore = currentScore;
        selectedMetric = metric as MetricWithDomain;
        exactSynonymMatch = currentExactSynonymMatch;
        metricNameMatch = currentMetricNameMatch;
        domainDetected = currentDomainDetected;
      }
    }

    const period = detectPeriod(normalizedInput);
    const groupBy = detectGroupBy(normalizedInput);
    const confidence = calculateConfidence({
      exactSynonymMatch,
      metricNameMatch,
      periodDetected: Boolean(period),
      groupByDetected: groupBy.length > 0,
      domainDetected
    });

    const needsClarification = !selectedMetric || confidence < 0.5;
    const skillsSuggested = detectSuggestedSkills(input, Boolean(selectedMetric), Boolean(period), groupBy);

    const plan = {
      intent: "query_metric",
      domain: !needsClarification && selectedMetric
        ? {
            id: selectedMetric.domain.id,
            slug: selectedMetric.domain.slug,
            name: selectedMetric.domain.name
          }
        : null,
      metric: !needsClarification && selectedMetric
        ? {
            id: selectedMetric.id,
            technicalKey: selectedMetric.technicalKey,
            name: selectedMetric.name,
            unit: selectedMetric.unit,
            daxMeasure: selectedMetric.daxMeasure
          }
        : null,
      period,
      groupBy,
      filters: [],
      skillsSuggested,
      confidence,
      needsClarification,
      explanation: buildExplanation(selectedMetric?.name ?? null, period, groupBy, needsClarification)
    };

    await this.semanticRepository.createTest({
      input,
      generatedPlan: plan,
      confidence,
      needsClarification
    });

    return plan;
  }

  getHistory(limit: number) {
    return this.semanticRepository.getHistory(limit);
  }
}
