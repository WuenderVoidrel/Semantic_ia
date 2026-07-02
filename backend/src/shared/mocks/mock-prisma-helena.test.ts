import { describe, expect, it } from "vitest";
import { MockPrismaClient } from "./mock-prisma.js";

describe("MockPrismaClient — models Helena", () => {
  it("faz upsert de conversa por sourceSessionId (find + create + update)", async () => {
    const prisma = new MockPrismaClient();
    const created = await prisma.helenaConversation.create({
      data: { sourceSessionId: "s1", chatSlug: "helena", userLabel: null, startedAt: new Date(), lastTurnAt: new Date(), turnCount: 0 }
    });
    expect(created.id).toBeTruthy();

    const found = await prisma.helenaConversation.findFirst({ where: { sourceSessionId: "s1" } });
    expect(found?.id).toBe(created.id);
  });

  it("turn e unico por sourceAssistantMessageId", async () => {
    const prisma = new MockPrismaClient();
    const conv = await prisma.helenaConversation.create({
      data: { sourceSessionId: "s1", chatSlug: "helena", userLabel: null, startedAt: new Date(), lastTurnAt: new Date(), turnCount: 0 }
    });
    await prisma.helenaTurn.create({
      data: { conversationId: conv.id, sourceSessionId: "s1", sourceUserMessageId: "u1", sourceAssistantMessageId: "a1", sourceCreatedAt: new Date(), question: "q", answer: "r", hasDivergence: false }
    });
    const dup = await prisma.helenaTurn.findUnique({ where: { sourceAssistantMessageId: "a1" } });
    expect(dup?.sourceAssistantMessageId).toBe("a1");
    expect(await prisma.helenaTurn.count()).toBe(1);
  });

  it("turn findMany suporta where/skip/take e count com where", async () => {
    const prisma = new MockPrismaClient();
    const conv = await prisma.helenaConversation.create({
      data: { sourceSessionId: "s1", chatSlug: "helena", userLabel: null, startedAt: new Date(), lastTurnAt: new Date(), turnCount: 0 }
    });
    const base = { conversationId: conv.id, sourceSessionId: "s1", sourceUserMessageId: null, question: "q", answer: "r" };
    await prisma.helenaTurn.create({ data: { ...base, sourceAssistantMessageId: "t1", sourceCreatedAt: new Date("2026-06-01T10:00:00Z"), domain: "agricola", hasDivergence: false } });
    await prisma.helenaTurn.create({ data: { ...base, sourceAssistantMessageId: "t2", sourceCreatedAt: new Date("2026-06-02T10:00:00Z"), domain: "plantio", hasDivergence: true, studioConfidence: 0.7, feedbackRating: "dislike" } });
    await prisma.helenaTurn.create({ data: { ...base, sourceAssistantMessageId: "t3", sourceCreatedAt: new Date("2026-06-03T10:00:00Z"), domain: "agricola", hasDivergence: false, studioConfidence: 0.5 } });

    const agricola = await prisma.helenaTurn.findMany({ where: { domain: "agricola" } });
    expect(agricola.map((t) => t.sourceAssistantMessageId).sort()).toEqual(["t1", "t3"]);

    const pendentes = await prisma.helenaTurn.findMany({ where: { studioConfidence: null } });
    expect(pendentes.map((t) => t.sourceAssistantMessageId)).toEqual(["t1"]);

    const divergentes = await prisma.helenaTurn.count({ where: { hasDivergence: true } });
    expect(divergentes).toBe(1);

    const pagina = await prisma.helenaTurn.findMany({ orderBy: { sourceCreatedAt: "desc" }, skip: 1, take: 1 });
    expect(pagina.map((t) => t.sourceAssistantMessageId)).toEqual(["t2"]);

    const comFeedback = await prisma.helenaTurn.findMany({ where: { feedbackRating: "dislike" } });
    expect(comFeedback).toHaveLength(1);
  });

  it("syncRun findFirst filtra por status e ordena", async () => {
    const prisma = new MockPrismaClient();
    await prisma.helenaSyncRun.create({ data: { status: "success", trigger: "schedule", turnsImported: 2, startedAt: new Date("2026-06-30T10:00:00Z"), finishedAt: new Date(), watermark: new Date("2026-06-30T09:00:00Z"), error: null } });
    await prisma.helenaSyncRun.create({ data: { status: "error", trigger: "schedule", turnsImported: 0, startedAt: new Date("2026-06-30T11:00:00Z"), finishedAt: new Date(), watermark: null, error: "x" } });
    const last = await prisma.helenaSyncRun.findFirst({ where: { status: "success" }, orderBy: { startedAt: "desc" } });
    expect(last?.watermark).toEqual(new Date("2026-06-30T09:00:00Z"));
  });
});
