import type { Prisma } from "@prisma/client";

import type { AppDatabaseClient } from "../../shared/types/database-client.js";

type Domain = { id: string; name: string; slug: string };
type Metric = { id: string; domainId: string; name: string; technicalKey: string; daxMeasure: string; unit: string | null; synonyms: unknown; status: string };
type SemanticTest = { id: string };
type JsonInput = Prisma.InputJsonValue;

type MetricWithDomain = Metric & {
  domain: Domain;
};

type CreateTestInput = {
  input: string;
  normalizedInput?: string;
  generatedPlan: JsonInput;
  confidence: number;
  needsClarification: boolean;
  resolvedDomainId?: string | null;
  resolvedMetricId?: string | null;
  periodValue?: string | null;
  groupBy?: JsonInput;
  relayResult?: JsonInput | null;
  helenaDomainSlug?: string | null;
  helenaMetricKey?: string | null;
  hasDivergence?: boolean;
};

export class SemanticRepository {
  constructor(private readonly prisma: AppDatabaseClient) {}

  getActiveMetricsWithDomain(): Promise<MetricWithDomain[]> {
    return this.prisma.metric.findMany({
      where: { status: "active" },
      include: {
        domain: true
      }
    }) as Promise<MetricWithDomain[]>;
  }

  createTest(input: CreateTestInput): Promise<SemanticTest> {
    return this.prisma.semanticTest.create({
      data: input as never
    }) as Promise<SemanticTest>;
  }

  createTokenMisses(items: Array<{ semanticTestId: string; token: string; normalizedToken: string; reason: string }>) {
    return Promise.all(items.map((data) => this.prisma.semanticTokenMiss.create({ data })));
  }

  async createAliasSuggestion(input: {
    semanticTestId: string;
    metricId: string;
    domainId?: string | null;
    suggestedAlias: string;
    normalizedAlias: string;
    evidence: JsonInput;
    confidence?: number | null;
  }) {
    const existing = await this.prisma.catalogSuggestion.findFirst({
      where: {
        status: "pending",
        metricId: input.metricId,
        normalizedAlias: input.normalizedAlias
      }
    });

    if (existing) {
      return existing;
    }

    return this.prisma.catalogSuggestion.create({
      data: {
        semanticTestId: input.semanticTestId,
        type: "alias_for_metric",
        status: "pending",
        metricId: input.metricId,
        domainId: input.domainId ?? null,
        suggestedAlias: input.suggestedAlias,
        normalizedAlias: input.normalizedAlias,
        evidence: input.evidence,
        confidence: input.confidence ?? null
      } as never
    });
  }

  updateTestRelay(input: {
    id: string;
    relayResult: JsonInput;
    helenaDomainSlug?: string | null;
    helenaMetricKey?: string | null;
    hasDivergence: boolean;
  }) {
    return this.prisma.semanticTest.update({
      where: { id: input.id },
      data: {
        relayResult: input.relayResult,
        helenaDomainSlug: input.helenaDomainSlug ?? null,
        helenaMetricKey: input.helenaMetricKey ?? null,
        hasDivergence: input.hasDivergence
      } as never
    });
  }

  getHistory(limit: number) {
    return this.prisma.semanticTest.findMany({
      orderBy: { createdAt: "desc" },
      take: limit
    });
  }
}
