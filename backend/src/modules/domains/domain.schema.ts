import { z } from "zod";

export const domainIdParamsSchema = z.object({
  id: z.string().uuid("ID do dominio invalido.")
});

export const createDomainBodySchema = z.object({
  name: z.string().min(2, "Nome do dominio obrigatorio."),
  slug: z.string().min(2, "Slug do dominio obrigatorio."),
  description: z.string().optional(),
  status: z.string().default("active")
});

export type CreateDomainBody = z.infer<typeof createDomainBodySchema>;
