import type { Prisma } from "@prisma/client";

type Metric = { id: string; domainId: string; name: string; technicalKey: string; daxMeasure: string; unit: string | null; synonyms: unknown; status: string };
type JsonInput = Prisma.InputJsonValue;
import { calculateConfidence } from "../../shared/utils/calculate-confidence.js";
import { normalizeText } from "../../shared/utils/normalize-text.js";

import type { GenerateSemanticPlanBody, RelaySemanticPlanBody } from "./semantic.schema.js";
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

type RelayResult = {
  targetUrl: string | null;
  forwarded: boolean;
  ok: boolean;
  status: number | null;
  response: unknown | null;
  error: string | null;
};

type GroupByValue = "shift" | "day" | "month" | "farm" | "front" | "equipment";

type CandidateMetric = {
  id: string;
  name: string;
  technicalKey: string;
  domainSlug: string;
  score: number;
  matchedAliases: string[];
  metricNameMatch: boolean;
  domainDetected: boolean;
};

type SemanticDiagnostics = {
  matchedAliases: string[];
  unmatchedTokens: string[];
  candidateMetrics: CandidateMetric[];
  confidenceBreakdown: {
    synonym: number;
    metricName: number;
    period: number;
    groupBy: number;
    domain: number;
  };
  lowConfidenceReasons: string[];
};

const PERIOD_RULES = [
  { keys: ["semana passada", "semana anterior"], period: { raw: "semana passada", type: "relative" as const, value: "previous_week" } },
  { keys: ["mes passado", "mês passado", "mes anterior", "mês anterior"], period: { raw: "mes passado", type: "relative" as const, value: "previous_month" } },
  { keys: ["ano passado", "ano anterior"], period: { raw: "ano passado", type: "relative" as const, value: "previous_year" } },
  { keys: ["mes atual", "mês atual"], period: { raw: "mes atual", type: "relative" as const, value: "current_month" } },
  { keys: ["hoje"], period: { raw: "hoje", type: "relative" as const, value: "today" } },
  { keys: ["ontem"], period: { raw: "ontem", type: "relative" as const, value: "yesterday" } },
  { keys: ["semana"], period: { raw: "semana", type: "relative" as const, value: "current_week" } },
  { keys: ["safra"], period: { raw: "safra", type: "business_period" as const, value: "harvest" } }
];

const GROUP_BY_RULES: Array<{ keys: string[]; value: GroupByValue }> = [
  { keys: ["turno", "turnos"], value: "shift" },
  { keys: ["dia", "dias"], value: "day" },
  { keys: ["por mes", "por mês", "mensal"], value: "month" },
  { keys: ["fazenda", "fazendas"], value: "farm" },
  { keys: ["frente", "frentes"], value: "front" },
  { keys: ["equipamento", "equipamentos"], value: "equipment" }
];

const STOPWORDS = new Set([
  "a", "ao", "aos", "as", "de", "da", "das", "do", "dos", "e", "em", "me", "no", "na", "nos", "nas",
  "o", "os", "ou", "por", "pra", "para", "que", "quanto", "qual", "quais", "com", "sem", "sobre", "um", "uma"
]);

function getSynonyms(rawSynonyms: unknown) {
  return Array.isArray(rawSynonyms) ? rawSynonyms.filter((value): value is string => typeof value === "string") : [];
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function tokenize(input: string) {
  return unique(
    normalizeText(input)
      .split(/[^a-z0-9]+/i)
      .map((token) => token.trim())
      .filter((token) => token.length > 2 && !STOPWORDS.has(token))
  );
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
    return "A pergunta ainda precisa de mais contexto para identificar a métrica com segurança.";
  }

  const fragments = [`A pergunta indica consulta da métrica ${metricName}`];

  if (period) {
    fragments.push(`com período ${period.raw}`);
  }

  if (groupBy.length > 0) {
    fragments.push(`e agrupamento por ${groupBy.join(", ")}`);
  }

  return `${fragments.join(" ")}.`;
}

function buildKnownTerms(metrics: MetricWithDomain[]) {
  const terms = new Set<string>();

  for (const metric of metrics) {
    for (const value of [metric.name, metric.technicalKey, metric.domain.name, metric.domain.slug, ...getSynonyms(metric.synonyms)]) {
      for (const token of tokenize(value)) {
        terms.add(token);
      }
    }
  }

  for (const rule of [...PERIOD_RULES, ...GROUP_BY_RULES]) {
    for (const key of rule.keys) {
      for (const token of tokenize(key)) {
        terms.add(token);
      }
    }
  }

  return terms;
}

function extractString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function extractHelenaSemanticResult(response: unknown) {
  if (!response || typeof response !== "object") {
    return { domainSlug: null, metricKey: null };
  }

  const record = response as Record<string, unknown>;
  const semantic = typeof record.semantic === "object" && record.semantic ? record.semantic as Record<string, unknown> : {};
  const meta = typeof record._meta === "object" && record._meta ? record._meta as Record<string, unknown> : {};
  const lastContext = typeof record.last_context === "object" && record.last_context ? record.last_context as Record<string, unknown> : {};
  const metricsRequested = Array.isArray(record.metrics_requested)
    ? record.metrics_requested
    : Array.isArray(lastContext.metrics_requested)
      ? lastContext.metrics_requested
      : [];

  const domainSlug =
    extractString(meta.semantic_domain) ??
    extractString(semantic.domainSlug) ??
    extractString(semantic.domain) ??
    extractString(semantic.dominio) ??
    extractString(record.metric);

  const metricKey =
    extractString(meta.metric_key) ??
    extractString(semantic.metricKey) ??
    extractString(semantic.metric_key) ??
    extractString(semantic.metrica) ??
    (domainSlug && typeof metricsRequested[0] === "string" ? `${domainSlug}.${metricsRequested[0]}` : null);

  return { domainSlug, metricKey };
}

type SemanticServiceOptions = {
  relayUrl?: string;
  relayTimeoutMs?: number;
};

export class SemanticService {
  constructor(
    private readonly semanticRepository: SemanticRepository,
    private readonly options: SemanticServiceOptions = {}
  ) {}

  async analyze(data: GenerateSemanticPlanBody, options: { persist?: boolean } = {}) {
    const input = data.input.trim();
    const normalizedInput = normalizeText(input);
    const metrics = await this.semanticRepository.getActiveMetricsWithDomain();

    let selectedMetric: MetricWithDomain | null = null;
    let bestScore = 0;
    let exactSynonymMatch = false;
    let metricNameMatch = false;
    let domainDetected = false;
    let selectedMatchedAliases: string[] = [];
    const candidates: CandidateMetric[] = [];

    for (const metric of metrics) {
      const normalizedMetricName = normalizeText(metric.name);
      const normalizedDomainName = normalizeText(metric.domain.name);
      const normalizedDomainSlug = normalizeText(metric.domain.slug);
      const synonyms = getSynonyms(metric.synonyms);
      const normalizedSynonyms = synonyms.map((synonym) => ({ raw: synonym, normalized: normalizeText(synonym) }));

      let currentScore = 0;
      const currentMatchedAliases = normalizedSynonyms
        .filter((synonym) => normalizedInput.includes(synonym.normalized))
        .map((synonym) => synonym.raw);
      const currentExactSynonymMatch = currentMatchedAliases.length > 0;
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

      if (currentScore > 0) {
        candidates.push({
          id: metric.id,
          name: metric.name,
          technicalKey: metric.technicalKey,
          domainSlug: metric.domain.slug,
          score: Number(currentScore.toFixed(2)),
          matchedAliases: currentMatchedAliases,
          metricNameMatch: currentMetricNameMatch,
          domainDetected: currentDomainDetected
        });
      }

      if (currentScore > bestScore) {
        bestScore = currentScore;
        selectedMetric = metric as MetricWithDomain;
        exactSynonymMatch = currentExactSynonymMatch;
        metricNameMatch = currentMetricNameMatch;
        domainDetected = currentDomainDetected;
        selectedMatchedAliases = currentMatchedAliases;
      }
    }

    const period = detectPeriod(normalizedInput);
    const groupBy = detectGroupBy(normalizedInput);
    const confidenceBreakdown = {
      synonym: exactSynonymMatch ? 0.5 : 0,
      metricName: metricNameMatch ? 0.3 : 0,
      period: period ? 0.1 : 0,
      groupBy: groupBy.length > 0 ? 0.1 : 0,
      domain: domainDetected ? 0.1 : 0
    };
    const confidence = calculateConfidence({
      exactSynonymMatch,
      metricNameMatch,
      periodDetected: Boolean(period),
      groupByDetected: groupBy.length > 0,
      domainDetected
    });

    const needsClarification = !selectedMetric || confidence < 0.5;
    const skillsSuggested = detectSuggestedSkills(input, Boolean(selectedMetric), Boolean(period), groupBy);
    const knownTerms = buildKnownTerms(metrics);
    const unmatchedTokens = tokenize(input).filter((token) => !knownTerms.has(token));
    const lowConfidenceReasons = [
      !selectedMetric ? "Nenhuma métrica do catálogo foi resolvida." : null,
      selectedMetric && !exactSynonymMatch ? "Nenhum alias/sinônimo casou diretamente com a pergunta." : null,
      selectedMetric && confidence < 0.5 ? "Confiança abaixo do limiar mínimo de 50%." : null,
      unmatchedTokens.length > 0 ? "Há termos úteis sem match no catálogo." : null
    ].filter((reason): reason is string => Boolean(reason));

    const sortedCandidates = candidates.sort((first, second) => second.score - first.score).slice(0, 5);

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

    const diagnostics: SemanticDiagnostics = {
      matchedAliases: selectedMatchedAliases,
      unmatchedTokens,
      candidateMetrics: sortedCandidates,
      confidenceBreakdown,
      lowConfidenceReasons
    };

    let testId: string | null = null;

    if (options.persist) {
      const created = await this.semanticRepository.createTest({
        input,
        normalizedInput,
        generatedPlan: plan as JsonInput,
        confidence,
        needsClarification,
        resolvedDomainId: plan.domain?.id ?? null,
        resolvedMetricId: plan.metric?.id ?? null,
        periodValue: plan.period?.value ?? null,
        groupBy: groupBy as JsonInput
      });
      testId = created.id;

      await this.semanticRepository.createTokenMisses(
        unmatchedTokens.map((token) => ({
          semanticTestId: created.id,
          token,
          normalizedToken: token,
          reason: selectedMetric ? "not_matched_to_catalog_alias" : "metric_unresolved"
        }))
      );

      if (selectedMetric && (needsClarification || unmatchedTokens.length > 0)) {
        for (const token of unmatchedTokens.slice(0, 3)) {
          await this.semanticRepository.createAliasSuggestion({
            semanticTestId: created.id,
            metricId: selectedMetric.id,
            domainId: selectedMetric.domain.id,
            suggestedAlias: token,
            normalizedAlias: token,
            evidence: {
              input,
              plan,
              diagnostics,
              reason: "Termo sem match apareceu em pergunta com métrica candidata."
            } as JsonInput,
            confidence
          });
        }
      }
    }

    return { plan, diagnostics, testId };
  }

  async generatePlan(data: GenerateSemanticPlanBody) {
    const result = await this.analyze(data, { persist: true });
    return result.plan;
  }

  async relayPlan(data: RelaySemanticPlanBody) {
    const analysis = await this.analyze({ input: data.input }, { persist: true });
    const plan = analysis.plan;
    const targetUrl = this.options.relayUrl ?? null;

    if (!targetUrl) {
      return {
        input: data.input,
        plan,
        relay: {
          targetUrl: null,
          forwarded: false,
          ok: false,
          status: null,
          response: null,
          error: "HELENA_ROUTER_URL não configurada."
        } satisfies RelayResult
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.options.relayTimeoutMs ?? 15_000);

    try {
      const upstream = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        signal: controller.signal,
        body: JSON.stringify({
          sessionId: data.sessionId ?? `semantic-${Date.now()}`,
          mensagem: data.input,
          semantic: {
            enabled: true,
            mode: "assist",
            routing: "workflow",
            confidence: plan.confidence,
            minimumConfidence: 0.65,
            intent: plan.intent,
            domain: plan.domain?.slug ?? null,
            metric: plan.metric?.technicalKey ?? null,
            period: plan.period,
            groupBy: plan.groupBy,
            needsClarification: plan.needsClarification,
            explanation: plan.explanation
          }
        })
      });

      let response: unknown = null;
      try {
        response = await upstream.json();
      } catch {
        response = await upstream.text();
      }

      const helena = extractHelenaSemanticResult(response);
      const hasDivergence = Boolean(
        (helena.domainSlug && plan.domain?.slug && helena.domainSlug !== plan.domain.slug) ||
          (helena.metricKey && plan.metric?.technicalKey && helena.metricKey !== plan.metric.technicalKey)
      );

      const relay = {
        targetUrl,
        forwarded: true,
        ok: upstream.ok,
        status: upstream.status,
        response,
        error: upstream.ok ? null : "Router retornou resposta não-sucedida."
      } satisfies RelayResult;

      if (analysis.testId) {
        await this.semanticRepository.updateTestRelay({
          id: analysis.testId,
          relayResult: relay as JsonInput,
          helenaDomainSlug: helena.domainSlug,
          helenaMetricKey: helena.metricKey,
          hasDivergence
        });
      }

      return {
        input: data.input,
        plan,
        relay
      };
    } catch (error) {
      return {
        input: data.input,
        plan,
        relay: {
          targetUrl,
          forwarded: false,
          ok: false,
          status: null,
          response: null,
          error: error instanceof Error ? error.message : "Falha ao encaminhar para a Helena."
        } satisfies RelayResult
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  getHistory(limit: number) {
    return this.semanticRepository.getHistory(limit);
  }
}

