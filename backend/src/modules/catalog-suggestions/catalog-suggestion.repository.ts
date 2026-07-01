import type { Prisma } from "@prisma/client";

import type { AppDatabaseClient } from "../../shared/types/database-client.js";

type JsonInput = Prisma.InputJsonValue;

export class CatalogSuggestionRepository {
  constructor(private readonly prisma: AppDatabaseClient) {}

  findMany(status: string) {
    return this.prisma.catalogSuggestion.findMany({
      where: status === "all" ? undefined : { status },
      include: { metric: { include: { domain: true } }, semanticTest: true },
      orderBy: { createdAt: "desc" }
    });
  }

  findById(id: string) {
    return this.prisma.catalogSuggestion.findUnique({
      where: { id },
      include: { metric: true }
    });
  }

  updateStatus(id: string, status: "approved" | "rejected", data: { reviewedBy?: string; reviewNote?: string }) {
    return this.prisma.catalogSuggestion.update({
      where: { id },
      data: {
        status,
        reviewedBy: data.reviewedBy ?? null,
        reviewNote: data.reviewNote ?? null,
        reviewedAt: new Date()
      }
    });
  }

  updateMetricSynonyms(metricId: string, synonyms: JsonInput) {
    return this.prisma.metric.update({
      where: { id: metricId },
      data: { synonyms } as never
    });
  }
}
