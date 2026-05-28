import { z } from "zod";

export const generateSemanticPlanBodySchema = z.object({
  input: z.string().min(3, "Digite uma pergunta valida para gerar o plano.")
});

export const semanticHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20)
});

export type GenerateSemanticPlanBody = z.infer<typeof generateSemanticPlanBodySchema>;
