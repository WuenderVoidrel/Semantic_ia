import type { Prisma } from "@prisma/client";

type JsonInput = Prisma.InputJsonValue;
import { AppError } from "../../shared/errors/app-error.js";

import type { UpdateGoldenCaseBody } from "./golden-case.schema.js";
import { GoldenCaseRepository } from "./golden-case.repository.js";

type GeneratedPlan = {
  domain?: { slug?: string } | null;
  metric?: { technicalKey?: string } | null;
  period?: { value?: string } | null;
  groupBy?: string[];
  needsClarification?: boolean;
};

function readPlan(value: unknown): GeneratedPlan {
  return value && typeof value === "object" ? value as GeneratedPlan : {};
}

function toExportCase(item: {
  input: string;
  expectedDomainSlug: string | null;
  expectedMetricKey: string | null;
  expectedPeriodValue: string | null;
  expectedGroupBy: unknown;
  expectedNeedsClarification: boolean | null;
  tags: unknown;
  notes: string | null;
}) {
  return {
    input: item.input,
    expected: {
      domainSlug: item.expectedDomainSlug,
      metricKey: item.expectedMetricKey,
      periodValue: item.expectedPeriodValue,
      groupBy: Array.isArray(item.expectedGroupBy) ? item.expectedGroupBy : [],
      needsClarification: item.expectedNeedsClarification
    },
    assert: ["domainSlug", "metricKey", "periodValue", "groupBy", "needsClarification"],
    volatile: ["biValue", "helenaFinalText", "timestamps", "latency", "rawRouterResponse"],
    tags: Array.isArray(item.tags) ? item.tags : [],
    notes: item.notes
  };
}

export class GoldenCaseService {
  constructor(private readonly repository: GoldenCaseRepository) {}

  async createFromTest(semanticTestId: string, overrides: UpdateGoldenCaseBody = {}) {
    const test = await this.repository.findTestById(semanticTestId);

    if (!test) {
      throw new AppError("Teste semântico não encontrado.", 404);
    }

    const plan = readPlan(test.generatedPlan);

    return this.repository.upsertFromTest({
      semanticTestId,
      input: test.input,
      expectedDomainSlug: overrides.expectedDomainSlug ?? plan.domain?.slug ?? null,
      expectedMetricKey: overrides.expectedMetricKey ?? plan.metric?.technicalKey ?? null,
      expectedPeriodValue: overrides.expectedPeriodValue ?? plan.period?.value ?? null,
      expectedGroupBy: (overrides.expectedGroupBy ?? plan.groupBy ?? []) as JsonInput,
      expectedNeedsClarification: overrides.expectedNeedsClarification ?? plan.needsClarification ?? test.needsClarification,
      tags: (overrides.tags ?? []) as JsonInput,
      notes: overrides.notes ?? null
    });
  }

  list() {
    return this.repository.findMany();
  }

  async export() {
    const items = await this.repository.findMany();
    return items.map(toExportCase);
  }
}

