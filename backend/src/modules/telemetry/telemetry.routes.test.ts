import Fastify from "fastify";
import { afterEach, describe, expect, it } from "vitest";

import { globalErrorHandler } from "../../shared/errors/error-handler.js";
import { MockPrismaClient } from "../../shared/mocks/mock-prisma.js";
import { telemetryRoutes } from "./telemetry.routes.js";

async function buildApp() {
  const app = Fastify();
  const prisma = new MockPrismaClient();
  const conv = await prisma.helenaConversation.create({
    data: { sourceSessionId: "s1", chatSlug: "helena", userLabel: null, startedAt: new Date(), lastTurnAt: new Date(), turnCount: 0 }
  });
  await prisma.helenaTurn.create({
    data: { conversationId: conv.id, sourceSessionId: "s1", sourceAssistantMessageId: "a1", sourceCreatedAt: new Date("2026-06-30T10:00:00Z"), question: "quanto moeu ontem?", answer: "r", domain: "agricola", costUsd: 0.02, totalTokens: 100, latencyMs: 1200, status: "success", feedbackRating: "like" }
  });
  app.decorate("prisma", prisma as never);
  app.setErrorHandler(globalErrorHandler);
  await telemetryRoutes(app);
  await app.ready();
  return app;
}

describe("rotas de telemetria", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  afterEach(async () => {
    await app.close();
  });

  it("GET /api/telemetry/stats retorna os totais agregados", async () => {
    app = await buildApp();
    const res = await app.inject({ method: "GET", url: "/api/telemetry/stats" });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.totals.turns).toBe(1);
    expect(body.totals.conversations).toBe(1);
    expect(body.feedback.like).toBe(1);
    expect(Array.isArray(body.byDomain)).toBe(true);
    expect(body.volumeByDay[0]).toEqual({ day: "2026-06-30", turns: 1 });
  });

  it("GET /api/telemetry/turns lista com paginacao e filtros", async () => {
    app = await buildApp();
    const res = await app.inject({ method: "GET", url: "/api/telemetry/turns?limit=10" });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.total).toBe(1);
    expect(body.items).toHaveLength(1);
    expect(body.items[0].question).toBe("quanto moeu ontem?");

    const vazio = await app.inject({ method: "GET", url: "/api/telemetry/turns?domain=inexistente" });
    expect(vazio.json().total).toBe(0);
  });

  it("GET /api/telemetry/turns/:id retorna detalhe e 404 para id desconhecido", async () => {
    app = await buildApp();
    const list = await app.inject({ method: "GET", url: "/api/telemetry/turns" });
    const id = list.json().items[0].id as string;

    const detail = await app.inject({ method: "GET", url: `/api/telemetry/turns/${id}` });
    expect(detail.statusCode).toBe(200);
    expect(detail.json().answer).toBe("r");

    const missing = await app.inject({ method: "GET", url: "/api/telemetry/turns/nao-existe" });
    expect(missing.statusCode).toBe(404);
  });

  it("POST /api/telemetry/enrich processa pendentes e e incremental", async () => {
    app = await buildApp();
    const first = await app.inject({ method: "POST", url: "/api/telemetry/enrich", payload: {} });
    expect(first.statusCode).toBe(200);
    expect(first.json().processed).toBe(1);

    const second = await app.inject({ method: "POST", url: "/api/telemetry/enrich", payload: { limit: 50 } });
    expect(second.json().processed).toBe(0);
  });
});
