import { describe, expect, it } from "vitest";

import { MockPrismaClient } from "../../shared/mocks/mock-prisma.js";
import { SemanticRepository } from "../semantic/semantic.repository.js";
import { SemanticService } from "../semantic/semantic.service.js";
import { EnrichService } from "./enrich.service.js";
import { TelemetryRepository } from "./telemetry.repository.js";

async function seedTurn(prisma: MockPrismaClient, id: string, question: string, domain: string | null) {
  const conv = await prisma.helenaConversation.findFirst({ where: { sourceSessionId: "s1" } })
    ?? await prisma.helenaConversation.create({
      data: { sourceSessionId: "s1", chatSlug: "helena", userLabel: null, startedAt: new Date(), lastTurnAt: new Date(), turnCount: 0 }
    });
  return prisma.helenaTurn.create({
    data: {
      conversationId: conv.id,
      sourceSessionId: "s1",
      sourceAssistantMessageId: id,
      sourceCreatedAt: new Date("2026-06-30T10:00:00Z"),
      question,
      answer: "resposta",
      domain,
      hasDivergence: false
    }
  });
}

function buildService(prisma: MockPrismaClient) {
  const semanticService = new SemanticService(new SemanticRepository(prisma));
  return new EnrichService(new TelemetryRepository(prisma), semanticService);
}

describe("EnrichService.enrichPending", () => {
  it("enriquece com o plano do Studio e marca divergencia quando dominios diferem", async () => {
    const prisma = new MockPrismaClient();
    await seedTurn(prisma, "t1", "quanto moeu ontem por turno?", "agricola");
    await seedTurn(prisma, "t2", "quanto moeu ontem por turno?", "materia-prima");
    const service = buildService(prisma);

    const result = await service.enrichPending(10);

    expect(result.processed).toBe(2);
    expect(result.divergences).toBe(1);

    const t1 = await prisma.helenaTurn.findUnique({ where: { sourceAssistantMessageId: "t1" } });
    expect(t1?.studioDomain).toBe("agricola");
    expect(t1?.studioMetricKey).toBe("agricola.moagem");
    expect(t1?.studioConfidence).toBeCloseTo(0.7, 5);
    expect(t1?.hasDivergence).toBe(false);

    const t2 = await prisma.helenaTurn.findUnique({ where: { sourceAssistantMessageId: "t2" } });
    expect(t2?.hasDivergence).toBe(true);
  });

  it("e incremental: segunda rodada nao reprocessa", async () => {
    const prisma = new MockPrismaClient();
    await seedTurn(prisma, "t1", "quanto moeu ontem?", "agricola");
    const service = buildService(prisma);

    await service.enrichPending(10);
    const second = await service.enrichPending(10);

    expect(second.processed).toBe(0);
  });

  it("cria sugestao de alias para termo real sem match (com dedup)", async () => {
    const prisma = new MockPrismaClient();
    await seedTurn(prisma, "t1", "quanto moeu na moenda?", null);
    await seedTurn(prisma, "t2", "quanto moeu na moenda?", null);
    const service = buildService(prisma);

    const result = await service.enrichPending(10);

    expect(result.suggestions).toBe(1);
    const pending = await prisma.catalogSuggestion.findMany({ where: { status: "pending" } });
    expect(pending).toHaveLength(1);
    expect(pending[0].normalizedAlias).toBe("moenda");
    expect(pending[0].semanticTestId).toBeNull();
  });

  it("pergunta vazia/curta vira plano pulado com confidence 0, sem quebrar", async () => {
    const prisma = new MockPrismaClient();
    await seedTurn(prisma, "t1", "oi", null);
    const service = buildService(prisma);

    const result = await service.enrichPending(10);

    expect(result.processed).toBe(1);
    const t1 = await prisma.helenaTurn.findUnique({ where: { sourceAssistantMessageId: "t1" } });
    expect(t1?.studioConfidence).toBe(0);
    expect(t1?.hasDivergence).toBe(false);
  });
});
