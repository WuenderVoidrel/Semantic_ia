import type { Domain, Metric, Prisma } from "@prisma/client";

import type { AppDatabaseClient } from "../../shared/types/database-client.js";

type MetricWithDomain = Metric & {
  domain: Domain;
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

  createTest(input: {
    input: string;
    generatedPlan: Prisma.InputJsonValue;
    confidence: number;
    needsClarification: boolean;
  }) {
    return this.prisma.semanticTest.create({
      data: input
    });
  }

  getHistory(limit: number) {
    return this.prisma.semanticTest.findMany({
      orderBy: { createdAt: "desc" },
      take: limit
    });
  }
}
