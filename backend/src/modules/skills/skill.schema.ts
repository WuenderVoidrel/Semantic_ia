import { z } from "zod";

export const skillIdParamsSchema = z.object({
  id: z.string().uuid("ID da skill invalido.")
});

export const createSkillBodySchema = z.object({
  name: z.string().min(2, "Nome da skill obrigatorio."),
  type: z.string().min(2, "Tipo da skill obrigatorio."),
  description: z.string().optional(),
  status: z.string().default("active")
});

export type CreateSkillBody = z.infer<typeof createSkillBodySchema>;
