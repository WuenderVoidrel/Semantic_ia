import { describe, expect, it } from "vitest";
import { computeWatermark, normalizeJsonArray, rawToTurnData } from "./ingest.transform.js";
import type { RawBiTurn } from "../../shared/sources/helena-source.types.js";

function raw(overrides: Partial<RawBiTurn> = {}): RawBiTurn {
  return {
    sourceSessionId: "s1",
    sourceUserMessageId: "u1",
    sourceAssistantMessageId: "a1",
    chatSlug: "helena",
    question: null,
    answer: "resposta",
    sourceCreatedAt: new Date("2026-06-30T10:00:00Z"),
    domain: "agricola",
    routingReason: null,
    confidence: null,
    metricsRequested: null,
    periodStart: null,
    periodEnd: null,
    groupBy: "nao-array",
    toolUsed: null,
    model: null,
    promptTokens: null,
    completionTokens: null,
    totalTokens: null,
    cachedTokens: null,
    costUsd: null,
    latencyMs: null,
    status: null,
    errorCode: null,
    verifierOk: null,
    feedbackRating: null,
    feedbackReason: null,
    ...overrides
  };
}

describe("normalizeJsonArray", () => {
  it("mantem arrays", () => {
    expect(normalizeJsonArray(["moagem"])).toEqual(["moagem"]);
  });
  it("vira lista vazia para nao-array", () => {
    expect(normalizeJsonArray("x")).toEqual([]);
    expect(normalizeJsonArray(null)).toEqual([]);
  });
});

describe("rawToTurnData", () => {
  it("garante question string e normaliza json", () => {
    const data = rawToTurnData(raw({ question: null, metricsRequested: null, groupBy: "x" }));
    expect(data.question).toBe("");
    expect(data.metricsRequested).toEqual([]);
    expect(data.groupBy).toEqual([]);
  });
});

describe("computeWatermark", () => {
  it("retorna o maior sourceCreatedAt", () => {
    const turns = [raw({ sourceCreatedAt: new Date("2026-06-30T10:00:00Z") }), raw({ sourceCreatedAt: new Date("2026-06-30T12:00:00Z") })];
    expect(computeWatermark(turns, null)).toEqual(new Date("2026-06-30T12:00:00Z"));
  });
  it("mantem o previous quando nao ha turnos", () => {
    const previous = new Date("2026-06-29T00:00:00Z");
    expect(computeWatermark([], previous)).toEqual(previous);
  });
});
