import { z } from "zod";

export const generateSemanticPlanBodySchema = z.object({
  input: z.string().min(3, "Digite uma pergunta valida para gerar o plano.")
});

export const analyzeSemanticBodySchema = z
  .object({
    input: z.string().optional(),
    mensagem: z.string().optional(),
    sessionId: z.string().min(1).optional(),
    source: z.string().min(1).optional()
  })
  .superRefine((data, ctx) => {
    const input = data.input ?? data.mensagem;

    if (!input || input.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["input"],
        message: "Digite uma pergunta valida para gerar o plano."
      });
    }
  })
  .transform((data) => ({
    input: (data.input ?? data.mensagem ?? "").trim(),
    sessionId: data.sessionId,
    source: data.source
  }));

export const semanticHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20)
});

export const relaySemanticPlanBodySchema = generateSemanticPlanBodySchema.extend({
  sessionId: z.string().min(1).optional()
});

export type GenerateSemanticPlanBody = z.infer<typeof generateSemanticPlanBodySchema>;
export type AnalyzeSemanticBody = z.infer<typeof analyzeSemanticBodySchema>;
export type RelaySemanticPlanBody = z.infer<typeof relaySemanticPlanBodySchema>;
