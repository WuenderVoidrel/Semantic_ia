import { describe, expect, it } from "vitest";
import { MockPrismaClient } from "../../shared/mocks/mock-prisma.js";
import { FakeHelenaSource } from "../../shared/sources/fake-helena-source.js";
import type { HelenaSourceClient, RawBiTurn } from "../../shared/sources/helena-source.types.js";
import { IngestRepository } from "./ingest.repository.js";
import { IngestService } from "./ingest.service.js";

function raw(id: string, createdAt: string): RawBiTurn {
  return {
    sourceSessionId: "s1", sourceUserMessageId: `u-${id}`, sourceAssistantMessageId: id, chatSlug: "helena",
    question: "q", answer: "r", sourceCreatedAt: new Date(createdAt), domain: "agricola", routingReason: null,
    confidence: null, metricsRequested: ["moagem"], periodStart: null, periodEnd: null, groupBy: [], toolUsed: null,
    model: null, promptTokens: null, completionTokens: null, totalTokens: null, cachedTokens: null, costUsd: null,
    latencyMs: null, status: "success", errorCode: null, verifierOk: null, feedbackRating: null, feedbackReason: null
  };
}

describe("IngestService.runSync", () => {
  it("importa turnos novos e grava sync success com watermark", async () => {
    const prisma = new MockPrismaClient();
    const source = new FakeHelenaSource([raw("a1", "2026-06-30T10:00:00Z"), raw("a2", "2026-06-30T11:00:00Z")]);
    const service = new IngestService(new IngestRepository(prisma), source, { filter: { chatSlugs: [] } });

    const result = await service.runSync("manual");

    expect(result.status).toBe("success");
    expect(result.turnsImported).toBe(2);
    expect(await prisma.helenaTurn.count()).toBe(2);
  });

  it("é idempotente e incremental (2ª rodada não reimporta)", async () => {
    const prisma = new MockPrismaClient();
    const source = new FakeHelenaSource([raw("a1", "2026-06-30T10:00:00Z"), raw("a2", "2026-06-30T11:00:00Z")]);
    const service = new IngestService(new IngestRepository(prisma), source, { filter: { chatSlugs: [] } });

    await service.runSync("manual");
    const second = await service.runSync("manual");

    expect(second.turnsImported).toBe(0);
    expect(await prisma.helenaTurn.count()).toBe(2);
  });

  it("degrada com erro na fonte sem lançar (grava sync error)", async () => {
    const prisma = new MockPrismaClient();
    const failing: HelenaSourceClient = {
      fetchNewBiTurns: async () => {
        throw new Error("fonte indisponivel");
      },
      ping: async () => false,
      close: async () => undefined
    };
    const service = new IngestService(new IngestRepository(prisma), failing, { filter: { chatSlugs: [] } });

    const result = await service.runSync("schedule");

    expect(result.status).toBe("error");
    expect(result.error).toContain("fonte indisponivel");
    const last = await prisma.helenaSyncRun.findFirst({ where: { status: "error" }, orderBy: { startedAt: "desc" } });
    expect(last?.error).toContain("fonte indisponivel");
  });
});
