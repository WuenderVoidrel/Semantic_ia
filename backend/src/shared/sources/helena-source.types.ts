export type RawBiTurn = {
  sourceSessionId: string;
  sourceUserMessageId: string | null;
  sourceAssistantMessageId: string;
  chatSlug: string | null;
  question: string | null;
  answer: string;
  sourceCreatedAt: Date;
  domain: string | null;
  routingReason: string | null;
  confidence: number | null;
  metricsRequested: unknown;
  periodStart: Date | null;
  periodEnd: Date | null;
  groupBy: unknown;
  toolUsed: string | null;
  model: string | null;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  cachedTokens: number | null;
  costUsd: number | null;
  latencyMs: number | null;
  status: string | null;
  errorCode: string | null;
  verifierOk: boolean | null;
  feedbackRating: string | null;
  feedbackReason: string | null;
};

export type BiFilter = {
  chatSlugs: string[];
};

export interface HelenaSourceClient {
  fetchNewBiTurns(params: { since: Date | null; filter: BiFilter; limit: number }): Promise<RawBiTurn[]>;
  ping(): Promise<boolean>;
  close(): Promise<void>;
}
