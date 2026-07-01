import type { Prisma } from "@prisma/client";

import type { AppDatabaseClient } from "../../shared/types/database-client.js";
import type { TurnUpsertData } from "./ingest.transform.js";

type JsonInput = Prisma.InputJsonValue;

export class IngestRepository {
  constructor(private readonly prisma: AppDatabaseClient) {}

  async getLastWatermark(): Promise<Date | null> {
    const last = await this.prisma.helenaSyncRun.findFirst({
      where: { status: "success" },
      orderBy: { startedAt: "desc" }
    });
    return last?.watermark ?? null;
  }

  createSyncRun(trigger: string): Promise<{ id: string }> {
    return this.prisma.helenaSyncRun.create({
      data: { status: "running", trigger, turnsImported: 0, finishedAt: null, watermark: null, error: null } as never
    }) as Promise<{ id: string }>;
  }

  finishSyncRun(id: string, data: { status: string; turnsImported: number; watermark: Date | null; error: string | null }) {
    return this.prisma.helenaSyncRun.update({
      where: { id },
      data: { ...data, finishedAt: new Date() } as never
    });
  }

  listRecentSyncRuns(limit: number) {
    return this.prisma.helenaSyncRun.findMany({ orderBy: { startedAt: "desc" }, take: limit });
  }

  async ensureConversation(data: { sourceSessionId: string; chatSlug: string | null; userLabel: string | null; sourceCreatedAt: Date }): Promise<{ id: string }> {
    const existing = await this.prisma.helenaConversation.findFirst({ where: { sourceSessionId: data.sourceSessionId } });

    if (existing) {
      await this.prisma.helenaConversation.update({
        where: { id: existing.id },
        data: {
          chatSlug: data.chatSlug ?? existing.chatSlug,
          lastTurnAt: data.sourceCreatedAt > existing.lastTurnAt ? data.sourceCreatedAt : existing.lastTurnAt
        } as never
      });
      return { id: existing.id };
    }

    const created = await this.prisma.helenaConversation.create({
      data: {
        sourceSessionId: data.sourceSessionId,
        chatSlug: data.chatSlug,
        userLabel: data.userLabel,
        startedAt: data.sourceCreatedAt,
        lastTurnAt: data.sourceCreatedAt,
        turnCount: 0
      } as never
    });
    return { id: (created as { id: string }).id };
  }

  async upsertTurn(conversationId: string, data: TurnUpsertData): Promise<{ id: string; created: boolean }> {
    const existing = await this.prisma.helenaTurn.findUnique({ where: { sourceAssistantMessageId: data.sourceAssistantMessageId } });

    const payload = {
      conversationId,
      sourceSessionId: data.sourceSessionId,
      sourceUserMessageId: data.sourceUserMessageId,
      sourceAssistantMessageId: data.sourceAssistantMessageId,
      sourceCreatedAt: data.sourceCreatedAt,
      question: data.question,
      answer: data.answer,
      domain: data.domain,
      routingReason: data.routingReason,
      confidence: data.confidence,
      metricsRequested: data.metricsRequested as JsonInput,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      groupBy: data.groupBy as JsonInput,
      toolUsed: data.toolUsed,
      model: data.model,
      promptTokens: data.promptTokens,
      completionTokens: data.completionTokens,
      totalTokens: data.totalTokens,
      cachedTokens: data.cachedTokens,
      costUsd: data.costUsd,
      latencyMs: data.latencyMs,
      status: data.status,
      errorCode: data.errorCode,
      verifierOk: data.verifierOk,
      feedbackRating: data.feedbackRating,
      feedbackReason: data.feedbackReason,
      hasDivergence: false
    };

    if (existing) {
      const updated = await this.prisma.helenaTurn.update({ where: { id: (existing as { id: string }).id }, data: payload as never });
      return { id: (updated as { id: string }).id, created: false };
    }

    const created = await this.prisma.helenaTurn.create({ data: payload as never });
    return { id: (created as { id: string }).id, created: true };
  }

  incrementConversationTurnCount(id: string, lastTurnAt: Date) {
    return this.prisma.helenaConversation.update({
      where: { id },
      data: { turnCount: { increment: 1 }, lastTurnAt } as never
    });
  }
}
