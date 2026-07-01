import { describe, expect, it } from "vitest";
import { MockPrismaClient } from "../../shared/mocks/mock-prisma.js";
import { IngestRepository } from "./ingest.repository.js";
import { rawToTurnData } from "./ingest.transform.js";
import type { RawBiTurn } from "../../shared/sources/helena-source.types.js";

function raw(id: string): RawBiTurn {
  return {
    sourceSessionId: "s1", sourceUserMessageId: `u-${id}`, sourceAssistantMessageId: id, chatSlug: "helena",
    question: "q", answer: "r", sourceCreatedAt: new Date("2026-06-30T10:00:00Z"), domain: "agricola",
    routingReason: null, confidence: null, metricsRequested: ["moagem"], periodStart: null, periodEnd: null,
    groupBy: [], toolUsed: null, model: null, promptTokens: null, completionTokens: null, totalTokens: null,
    cachedTokens: null, costUsd: null, latencyMs: null, status: "success", errorCode: null, verifierOk: null,
    feedbackRating: null, feedbackReason: null
  };
}

describe("IngestRepository", () => {
  it("upsertTurn cria uma vez e nao duplica (idempotente)", async () => {
    const prisma = new MockPrismaClient();
    const repo = new IngestRepository(prisma);
    const conv = await repo.ensureConversation({ sourceSessionId: "s1", chatSlug: "helena", userLabel: null, sourceCreatedAt: new Date("2026-06-30T10:00:00Z") });

    const first = await repo.upsertTurn(conv.id, rawToTurnData(raw("a1")));
    const second = await repo.upsertTurn(conv.id, rawToTurnData(raw("a1")));

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(await prisma.helenaTurn.count()).toBe(1);
  });

  it("getLastWatermark le do ultimo sync success", async () => {
    const prisma = new MockPrismaClient();
    const repo = new IngestRepository(prisma);
    const run = await repo.createSyncRun("manual");
    await repo.finishSyncRun(run.id, { status: "success", turnsImported: 1, watermark: new Date("2026-06-30T12:00:00Z"), error: null });

    expect(await repo.getLastWatermark()).toEqual(new Date("2026-06-30T12:00:00Z"));
  });
});
