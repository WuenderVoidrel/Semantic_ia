import type { Prisma } from "@prisma/client";

import type { AppDatabaseClient } from "../../shared/types/database-client.js";

type JsonInput = Prisma.InputJsonValue;

export type TurnListFilters = {
  domain?: string;
  feedback?: string;
  divergence?: boolean;
  limit: number;
  offset: number;
};

function buildTurnWhere(filters: Pick<TurnListFilters, "domain" | "feedback" | "divergence">) {
  const where: Record<string, unknown> = {};
  if (filters.domain) {
    where.domain = filters.domain;
  }
  if (filters.feedback) {
    where.feedbackRating = filters.feedback;
  }
  if (filters.divergence !== undefined) {
    where.hasDivergence = filters.divergence;
  }
  return where;
}

export class TelemetryRepository {
  constructor(private readonly prisma: AppDatabaseClient) {}

  getTurnsForStats() {
    return this.prisma.helenaTurn.findMany({});
  }

  countConversations() {
    return this.prisma.helenaConversation.count();
  }

  listTurns(filters: TurnListFilters) {
    return this.prisma.helenaTurn.findMany({
      where: buildTurnWhere(filters) as never,
      orderBy: { sourceCreatedAt: "desc" },
      skip: filters.offset,
      take: filters.limit
    } as never);
  }

  countTurns(filters: Pick<TurnListFilters, "domain" | "feedback" | "divergence">) {
    return this.prisma.helenaTurn.count({ where: buildTurnWhere(filters) as never });
  }

  getTurn(id: string) {
    return this.prisma.helenaTurn.findUnique({ where: { id } });
  }

  findUnenriched(limit: number) {
    return this.prisma.helenaTurn.findMany({
      where: { studioConfidence: null } as never,
      orderBy: { sourceCreatedAt: "asc" },
      take: limit
    } as never);
  }

  updateEnrichment(id: string, data: {
    studioPlan: JsonInput;
    studioDomain: string | null;
    studioMetricKey: string | null;
    studioConfidence: number;
    hasDivergence: boolean;
  }) {
    return this.prisma.helenaTurn.update({ where: { id }, data: data as never });
  }

  async createAliasSuggestion(input: {
    metricId: string;
    domainId?: string | null;
    suggestedAlias: string;
    normalizedAlias: string;
    evidence: JsonInput;
    confidence?: number | null;
  }): Promise<{ created: boolean }> {
    const existing = await this.prisma.catalogSuggestion.findFirst({
      where: {
        status: "pending",
        metricId: input.metricId,
        normalizedAlias: input.normalizedAlias
      }
    });

    if (existing) {
      return { created: false };
    }

    await this.prisma.catalogSuggestion.create({
      data: {
        semanticTestId: null,
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

    return { created: true };
  }
}
