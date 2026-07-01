import Fastify from "fastify";
import { afterEach, describe, expect, it } from "vitest";

import { MockPrismaClient } from "../../shared/mocks/mock-prisma.js";
import { FakeHelenaSource } from "../../shared/sources/fake-helena-source.js";
import type { RawBiTurn } from "../../shared/sources/helena-source.types.js";
import { IngestRepository } from "./ingest.repository.js";
import { IngestService } from "./ingest.service.js";
import { ingestRoutes } from "./ingest.routes.js";

function raw(id: string): RawBiTurn {
  return {
    sourceSessionId: "s1", sourceUserMessageId: `u-${id}`, sourceAssistantMessageId: id, chatSlug: "helena",
    question: "q", answer: "r", sourceCreatedAt: new Date("2026-06-30T10:00:00Z"), domain: "agricola", routingReason: null,
    confidence: null, metricsRequested: [], periodStart: null, periodEnd: null, groupBy: [], toolUsed: null, model: null,
    promptTokens: null, completionTokens: null, totalTokens: null, cachedTokens: null, costUsd: null, latencyMs: null,
    status: "success", errorCode: null, verifierOk: null, feedbackRating: null, feedbackReason: null
  };
}

async function buildTestApp() {
  const app = Fastify();
  const prisma = new MockPrismaClient();
  app.decorate("prisma", prisma as never);
  const service = new IngestService(new IngestRepository(prisma), new FakeHelenaSource([raw("a1")]), { filter: { chatSlugs: [] } });
  app.decorate("ingestService", service as never);
  await ingestRoutes(app);
  await app.ready();
  return app;
}

describe("rotas de ingestao", () => {
  let app: Awaited<ReturnType<typeof buildTestApp>>;
  afterEach(async () => {
    await app.close();
  });

  it("POST /api/ingest/sync importa e retorna resumo", async () => {
    app = await buildTestApp();
    const response = await app.inject({ method: "POST", url: "/api/ingest/sync" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: "success", turnsImported: 1 });
  });

  it("GET /api/ingest/status retorna runs e watermark", async () => {
    app = await buildTestApp();
    await app.inject({ method: "POST", url: "/api/ingest/sync" });
    const response = await app.inject({ method: "GET", url: "/api/ingest/status" });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(Array.isArray(body.runs)).toBe(true);
    expect(body.runs.length).toBeGreaterThan(0);
    expect(response.json().sourceHealthy).toBe(true);
  });
});
