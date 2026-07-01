import { describe, expect, it } from "vitest";
import { FakeHelenaSource } from "./fake-helena-source.js";
import type { RawBiTurn } from "./helena-source.types.js";

function turn(id: string, createdAt: string, chatSlug = "helena"): RawBiTurn {
  return {
    sourceSessionId: "s1",
    sourceUserMessageId: `u-${id}`,
    sourceAssistantMessageId: id,
    chatSlug,
    question: "qual a moagem ontem?",
    answer: "Ontem a moagem foi 11.302 t.",
    sourceCreatedAt: new Date(createdAt),
    domain: "agricola",
    routingReason: "lexical",
    confidence: 0.87,
    metricsRequested: ["moagem"],
    periodStart: null,
    periodEnd: null,
    groupBy: [],
    toolUsed: "query_template",
    model: "gpt-4.1-mini",
    promptTokens: 100,
    completionTokens: 20,
    totalTokens: 120,
    cachedTokens: 0,
    costUsd: 0.001,
    latencyMs: 5000,
    status: "success",
    errorCode: null,
    verifierOk: true,
    feedbackRating: null,
    feedbackReason: null
  };
}

describe("FakeHelenaSource", () => {
  const turns = [turn("a1", "2026-06-30T10:00:00Z"), turn("a2", "2026-06-30T11:00:00Z"), turn("a3", "2026-06-30T12:00:00Z", "entrevista-rh")];

  it("retorna todos quando since e null (filtro vazio = so slug permitido)", async () => {
    const source = new FakeHelenaSource(turns);
    const result = await source.fetchNewBiTurns({ since: null, filter: { chatSlugs: ["helena"] }, limit: 100 });
    expect(result.map((t) => t.sourceAssistantMessageId)).toEqual(["a1", "a2"]);
  });

  it("aplica o watermark (since) de forma incremental (exclusivo)", async () => {
    const source = new FakeHelenaSource(turns);
    const result = await source.fetchNewBiTurns({ since: new Date("2026-06-30T10:00:00Z"), filter: { chatSlugs: [] }, limit: 100 });
    expect(result.map((t) => t.sourceAssistantMessageId)).toEqual(["a1", "a2", "a3"].filter((id) => id !== "a1"));
  });

  it("respeita o limit e ordena por sourceCreatedAt asc", async () => {
    const source = new FakeHelenaSource(turns);
    const result = await source.fetchNewBiTurns({ since: null, filter: { chatSlugs: [] }, limit: 1 });
    expect(result.map((t) => t.sourceAssistantMessageId)).toEqual(["a1"]);
  });
});
