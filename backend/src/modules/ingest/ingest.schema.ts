import { z } from "zod";

export const syncStatusQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(10)
});

export type SyncStatusQuery = z.infer<typeof syncStatusQuerySchema>;
