import { z } from "zod";

export const metricIdParamsSchema = z.object({
  id: z.string().uuid("ID da metrica invalido.")
});

export const createMetricBodySchema = z.object({
  domainId: z.string().uuid("Domain ID invalido."),
  name: z.string().min(2, "Nome da metrica obrigatorio."),
  technicalKey: z.string().min(3, "Chave tecnica obrigatoria."),
  daxMeasure: z.string().min(3, "Medida DAX obrigatoria."),
  unit: z.string().optional(),
  description: z.string().optional(),
  synonyms: z.array(z.string()).default([]),
  status: z.string().default("active")
});

export type CreateMetricBody = z.infer<typeof createMetricBodySchema>;
