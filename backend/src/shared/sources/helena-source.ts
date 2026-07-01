import pg from "pg";

import type { BiFilter, HelenaSourceClient, RawBiTurn } from "./helena-source.types.js";

const SELECT_BI_TURNS = `
SELECT
  am.id                              AS source_assistant_message_id,
  am.session_id::text                AS source_session_id,
  um.id                              AS source_user_message_id,
  c.slug                             AS chat_slug,
  um.content                         AS question,
  am.content                         AS answer,
  am.created_at                      AS source_created_at,
  am.metadata->>'routing_domain'     AS domain,
  am.metadata->>'routing_reason'     AS routing_reason,
  NULLIF(am.metadata->>'confidence','')::float AS confidence,
  COALESCE(sc.metrics_requested, am.metadata->'metrics_requested') AS metrics_requested,
  COALESCE(sc.date_start, NULLIF(am.metadata->>'date_start','')::date) AS period_start,
  COALESCE(sc.date_end, NULLIF(am.metadata->>'date_end','')::date)     AS period_end,
  COALESCE(sc.group_bys, am.metadata->'group_bys')                    AS group_by,
  am.metadata->'_meta'->>'tool_used' AS tool_used,
  COALESCE(am.metadata->'_meta'->>'model', wr.model)                 AS model,
  COALESCE((am.metadata->'_meta'->>'prompt_tokens')::int, wr.prompt_tokens)         AS prompt_tokens,
  COALESCE((am.metadata->'_meta'->>'completion_tokens')::int, wr.completion_tokens) AS completion_tokens,
  COALESCE((am.metadata->'_meta'->>'total_tokens')::int, wr.total_tokens)           AS total_tokens,
  COALESCE((am.metadata->'_meta'->>'cached_tokens')::int, wr.cached_tokens)         AS cached_tokens,
  COALESCE((am.metadata->'_meta'->>'estimated_cost_usd')::numeric, wr.estimated_cost) AS cost_usd,
  wr.latency_ms                      AS latency_ms,
  COALESCE(wr.status, CASE WHEN am.metadata->>'error_code' IS NULL THEN 'success' ELSE 'error' END) AS status,
  COALESCE(am.metadata->>'error_code', wr.error_message) AS error_code,
  (am.metadata->'_meta'->>'verifier_ok')::boolean AS verifier_ok,
  fb.rating                          AS feedback_rating,
  fb.reason_code                     AS feedback_reason
FROM chat_messages am
JOIN chat_sessions s ON s.id = am.session_id
JOIN chats c ON c.id = s.chat_id
LEFT JOIN LATERAL (
  SELECT u.id, u.content
  FROM chat_messages u
  WHERE u.session_id = am.session_id AND u.role = 'user' AND u.created_at <= am.created_at
  ORDER BY u.created_at DESC
  LIMIT 1
) um ON true
-- helena_session_context.session_id e text; chat_messages/workflow_runs.session_id sao uuid — dai o ::text so no join de session_context.
LEFT JOIN helena_session_context sc ON sc.session_id = am.session_id::text
-- Heuristica: casa o workflow_run mais recente ate ~2s apos a msg do assistente (nao ha message_id em workflow_runs).
LEFT JOIN LATERAL (
  SELECT w.model, w.prompt_tokens, w.completion_tokens, w.total_tokens, w.cached_tokens,
         w.estimated_cost, w.latency_ms, w.status, w.error_message
  FROM workflow_runs w
  WHERE w.session_id = am.session_id AND w.created_at <= am.created_at + interval '2 seconds'
  ORDER BY w.created_at DESC
  LIMIT 1
) wr ON true
LEFT JOIN LATERAL (
  SELECT f.rating, f.reason_code
  FROM chat_message_feedback f
  WHERE f.message_id = am.id
  ORDER BY f.created_at DESC
  LIMIT 1
) fb ON true
WHERE am.role = 'assistant'
  AND c.interview_template IS NULL
  AND ($1::timestamptz IS NULL OR am.created_at >= $1)  -- >= (nao >) + idempotencia por sourceAssistantMessageId evita pular turnos com mesmo timestamp na borda do LIMIT
  AND (cardinality($2::text[]) = 0 OR c.slug = ANY($2))
ORDER BY am.created_at ASC
LIMIT $3;
`;

type Row = Record<string, unknown>;

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toDate(value: unknown): Date | null {
  return value instanceof Date ? value : value ? new Date(String(value)) : null;
}

function mapRow(row: Row): RawBiTurn {
  return {
    sourceSessionId: String(row.source_session_id),
    sourceUserMessageId: row.source_user_message_id ? String(row.source_user_message_id) : null,
    sourceAssistantMessageId: String(row.source_assistant_message_id),
    chatSlug: row.chat_slug ? String(row.chat_slug) : null,
    question: row.question ? String(row.question) : null,
    answer: String(row.answer ?? ""),
    sourceCreatedAt: toDate(row.source_created_at) ?? new Date(),
    domain: row.domain ? String(row.domain) : null,
    routingReason: row.routing_reason ? String(row.routing_reason) : null,
    confidence: toNumber(row.confidence),
    metricsRequested: row.metrics_requested ?? null,
    periodStart: toDate(row.period_start),
    periodEnd: toDate(row.period_end),
    groupBy: row.group_by ?? null,
    toolUsed: row.tool_used ? String(row.tool_used) : null,
    model: row.model ? String(row.model) : null,
    promptTokens: toNumber(row.prompt_tokens),
    completionTokens: toNumber(row.completion_tokens),
    totalTokens: toNumber(row.total_tokens),
    cachedTokens: toNumber(row.cached_tokens),
    costUsd: toNumber(row.cost_usd),
    latencyMs: toNumber(row.latency_ms),
    status: row.status ? String(row.status) : null,
    errorCode: row.error_code ? String(row.error_code) : null,
    verifierOk: typeof row.verifier_ok === "boolean" ? row.verifier_ok : null,
    feedbackRating: row.feedback_rating ? String(row.feedback_rating) : null,
    feedbackReason: row.feedback_reason ? String(row.feedback_reason) : null
  };
}

export class PgHelenaSource implements HelenaSourceClient {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = new pg.Pool({
      connectionString,
      max: 4,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      statement_timeout: 15000
    });
  }

  async fetchNewBiTurns(params: { since: Date | null; filter: BiFilter; limit: number }): Promise<RawBiTurn[]> {
    const result = await this.pool.query(SELECT_BI_TURNS, [params.since, params.filter.chatSlugs, params.limit]);
    return result.rows.map((row) => mapRow(row as Row));
  }

  async ping(): Promise<boolean> {
    try {
      await this.pool.query("SELECT 1");
      return true;
    } catch {
      return false;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
