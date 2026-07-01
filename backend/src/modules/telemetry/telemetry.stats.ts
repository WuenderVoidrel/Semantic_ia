export type StatTurn = {
  domain: string | null;
  costUsd: number | null;
  totalTokens: number | null;
  latencyMs: number | null;
  status: string | null;
  errorCode: string | null;
  feedbackRating: string | null;
  sourceCreatedAt: Date;
};

export type TelemetryStats = {
  totals: { turns: number; conversations: number; costUsd: number; totalTokens: number; avgLatencyMs: number; errorRate: number };
  latency: { p50: number; p95: number };
  byDomain: Array<{ domain: string; turns: number; costUsd: number; avgLatencyMs: number }>;
  feedback: { like: number; dislike: number; none: number };
  volumeByDay: Array<{ day: string; turns: number }>;
};

export function percentile(values: number[], p: number): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.ceil((p / 100) * sorted.length);
  const index = Math.min(Math.max(rank, 1), sorted.length) - 1;
  return sorted[index];
}

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function computeTelemetryStats(turns: StatTurn[], conversations: number): TelemetryStats {
  const total = turns.length;
  const latencies = turns.map((t) => t.latencyMs).filter((v): v is number => typeof v === "number");
  const costTotal = turns.reduce((sum, t) => sum + (t.costUsd ?? 0), 0);
  const tokensTotal = turns.reduce((sum, t) => sum + (t.totalTokens ?? 0), 0);
  const errors = turns.filter((t) => t.status === "error" || (t.errorCode !== null && t.errorCode !== "")).length;
  const avgLatency = latencies.length > 0 ? latencies.reduce((s, v) => s + v, 0) / latencies.length : 0;

  const domainMap = new Map<string, { turns: number; cost: number; lat: number[] }>();
  for (const t of turns) {
    const key = t.domain ?? "(sem dominio)";
    const entry = domainMap.get(key) ?? { turns: 0, cost: 0, lat: [] };
    entry.turns += 1;
    entry.cost += t.costUsd ?? 0;
    if (typeof t.latencyMs === "number") {
      entry.lat.push(t.latencyMs);
    }
    domainMap.set(key, entry);
  }
  const byDomain = Array.from(domainMap.entries())
    .map(([domain, e]) => ({
      domain,
      turns: e.turns,
      costUsd: round(e.cost, 4),
      avgLatencyMs: e.lat.length > 0 ? Math.round(e.lat.reduce((s, v) => s + v, 0) / e.lat.length) : 0
    }))
    .sort((a, b) => b.turns - a.turns);

  const feedback = { like: 0, dislike: 0, none: 0 };
  for (const t of turns) {
    if (t.feedbackRating === "like") feedback.like += 1;
    else if (t.feedbackRating === "dislike") feedback.dislike += 1;
    else feedback.none += 1;
  }

  const dayMap = new Map<string, number>();
  for (const t of turns) {
    const day = t.sourceCreatedAt.toISOString().slice(0, 10);
    dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  }
  const volumeByDay = Array.from(dayMap.entries())
    .map(([day, count]) => ({ day, turns: count }))
    .sort((a, b) => a.day.localeCompare(b.day));

  return {
    totals: {
      turns: total,
      conversations,
      costUsd: round(costTotal, 4),
      totalTokens: tokensTotal,
      avgLatencyMs: Math.round(avgLatency),
      errorRate: total > 0 ? errors / total : 0
    },
    latency: { p50: percentile(latencies, 50), p95: percentile(latencies, 95) },
    byDomain,
    feedback,
    volumeByDay
  };
}
