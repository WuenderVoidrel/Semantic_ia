import { z } from "zod";

// divergence chega como string na querystring; z.coerce.boolean trataria "false" como true,
// entao o enum + transform e o parsing correto.
export const telemetryTurnsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  domain: z.string().min(1).optional(),
  feedback: z.enum(["like", "dislike"]).optional(),
  divergence: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true"))
});

export const telemetryTurnParamsSchema = z.object({
  id: z.string().min(1)
});

export const telemetryEnrichBodySchema = z.object({
  limit: z.coerce.number().int().positive().max(1000).default(200)
});

export type TelemetryTurnsQuery = z.infer<typeof telemetryTurnsQuerySchema>;
