import { z } from "zod";

export const semanticTestIdParamsSchema = z.object({
  semanticTestId: z.string().min(1)
});

export const updateGoldenCaseBodySchema = z.object({
  expectedDomainSlug: z.string().nullable().optional(),
  expectedMetricKey: z.string().nullable().optional(),
  expectedPeriodValue: z.string().nullable().optional(),
  expectedGroupBy: z.array(z.string()).optional(),
  expectedNeedsClarification: z.boolean().nullable().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().nullable().optional()
});

export type UpdateGoldenCaseBody = z.infer<typeof updateGoldenCaseBodySchema>;
