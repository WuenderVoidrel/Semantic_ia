import type { Prisma } from "@prisma/client";

import type { AppDatabaseClient } from "../../shared/types/database-client.js";

type JsonInput = Prisma.InputJsonValue;

export class GoldenCaseRepository {
  constructor(private readonly prisma: AppDatabaseClient) {}

  findTestById(id: string) {
    return this.prisma.semanticTest.findUnique({ where: { id } });
  }

  upsertFromTest(input: {
    semanticTestId: string;
    input: string;
    expectedDomainSlug?: string | null;
    expectedMetricKey?: string | null;
    expectedPeriodValue?: string | null;
    expectedGroupBy: JsonInput;
    expectedNeedsClarification?: boolean | null;
    tags?: JsonInput;
    notes?: string | null;
  }) {
    const data = {
      semanticTestId: input.semanticTestId,
      input: input.input,
      expectedDomainSlug: input.expectedDomainSlug ?? null,
      expectedMetricKey: input.expectedMetricKey ?? null,
      expectedPeriodValue: input.expectedPeriodValue ?? null,
      expectedGroupBy: input.expectedGroupBy,
      expectedNeedsClarification: input.expectedNeedsClarification ?? null,
      tags: input.tags,
      notes: input.notes ?? null
    };

    return this.prisma.goldenCase.upsert({
      where: { semanticTestId: input.semanticTestId },
      create: data as never,
      update: data as never
    });
  }

  findMany() {
    return this.prisma.goldenCase.findMany({ orderBy: { createdAt: "desc" } });
  }
}
