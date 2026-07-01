import { describe, expect, it } from "vitest";
import { computeTelemetryStats, percentile, type StatTurn } from "./telemetry.stats.js";

function turn(over: Partial<StatTurn> = {}): StatTurn {
  return {
    domain: "agricola",
    costUsd: 0.01,
    totalTokens: 100,
    latencyMs: 1000,
    status: "success",
    errorCode: null,
    feedbackRating: null,
    sourceCreatedAt: new Date("2026-06-30T10:00:00Z"),
    ...over
  };
}

describe("percentile", () => {
  it("p50 e p95 por nearest-rank", () => {
    const v = [10, 20, 30, 40, 50];
    expect(percentile(v, 50)).toBe(30);
    expect(percentile(v, 95)).toBe(50);
  });
  it("lista vazia => 0", () => {
    expect(percentile([], 50)).toBe(0);
  });
});

describe("computeTelemetryStats", () => {
  const turns: StatTurn[] = [
    turn({ costUsd: 0.02, latencyMs: 1000, feedbackRating: "like" }),
    turn({ costUsd: 0.04, latencyMs: 3000, feedbackRating: "dislike", domain: "materia-prima" }),
    turn({ costUsd: null, latencyMs: null, status: "error", errorCode: "NO_DATA", domain: null })
  ];

  it("totais somam custo/tokens e calculam taxa de erro", () => {
    const s = computeTelemetryStats(turns, 2);
    expect(s.totals.turns).toBe(3);
    expect(s.totals.conversations).toBe(2);
    expect(s.totals.costUsd).toBeCloseTo(0.06, 5);
    expect(s.totals.totalTokens).toBe(300);
    expect(s.totals.errorRate).toBeCloseTo(1 / 3, 5);
  });

  it("latencia media e percentis ignoram nulos", () => {
    const s = computeTelemetryStats(turns, 2);
    expect(s.totals.avgLatencyMs).toBe(2000);
    expect(s.latency.p50).toBe(1000); // nearest-rank p50 de [1000,3000] = 1000
  });

  it("agrupa por dominio (null => (sem dominio)) ordenado por turnos", () => {
    const s = computeTelemetryStats(turns, 2);
    expect(s.byDomain[0].turns).toBeGreaterThanOrEqual(s.byDomain[s.byDomain.length - 1].turns);
    expect(s.byDomain.some((d) => d.domain === "(sem dominio)")).toBe(true);
  });

  it("conta feedback e volume por dia", () => {
    const s = computeTelemetryStats(turns, 2);
    expect(s.feedback).toEqual({ like: 1, dislike: 1, none: 1 });
    expect(s.volumeByDay).toEqual([{ day: "2026-06-30", turns: 3 }]);
  });
});
