import Fastify from "fastify";
import { afterEach, describe, expect, it } from "vitest";

import { MockPrismaClient } from "../../shared/mocks/mock-prisma.js";
import { telemetryRoutes } from "./telemetry.routes.js";

async function buildApp() {
  const app = Fastify();
  const prisma = new MockPrismaClient();
  await prisma.helenaConversation.create({
    data: { sourceSessionId: "s1", chatSlug: "helena", userLabel: null, startedAt: new Date(), lastTurnAt: new Date(), turnCount: 0 }
  });
  await prisma.helenaTurn.create({
    data: { conversationId: "c1", sourceSessionId: "s1", sourceAssistantMessageId: "a1", sourceCreatedAt: new Date("2026-06-30T10:00:00Z"), question: "q", answer: "r", domain: "agricola", costUsd: 0.02, totalTokens: 100, latencyMs: 1200, status: "success", feedbackRating: "like" }
  });
  app.decorate("prisma", prisma as never);
  await telemetryRoutes(app);
  await app.ready();
  return app;
}

describe("GET /api/telemetry/stats", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  afterEach(async () => {
    await app.close();
  });

  it("retorna os totais agregados", async () => {
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
});
