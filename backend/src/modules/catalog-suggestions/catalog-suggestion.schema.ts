import { z } from "zod";

export const suggestionIdParamsSchema = z.object({
  id: z.string().min(1)
});

export const suggestionListQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "all"]).default("pending")
});

export const reviewSuggestionBodySchema = z.object({
  reviewedBy: z.string().min(1).optional(),
  reviewNote: z.string().optional()
});

export type ReviewSuggestionBody = z.infer<typeof reviewSuggestionBodySchema>;
