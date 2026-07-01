import type { BiFilter, HelenaSourceClient } from "../../shared/sources/helena-source.types.js";
import { IngestRepository } from "./ingest.repository.js";
import { computeWatermark, rawToTurnData } from "./ingest.transform.js";

type SyncTrigger = "schedule" | "manual";

type SyncResult = {
  status: "success" | "error";
  turnsImported: number;
  error: string | null;
};

export class IngestService {
  private readonly batchLimit: number;

  constructor(
    private readonly repository: IngestRepository,
    private readonly source: HelenaSourceClient,
    private readonly options: { filter: BiFilter; batchLimit?: number }
  ) {
    this.batchLimit = options.batchLimit ?? 500;
  }

  async runSync(trigger: SyncTrigger): Promise<SyncResult> {
    const run = await this.repository.createSyncRun(trigger);

    try {
      const watermark = await this.repository.getLastWatermark();
      const rawTurns = await this.source.fetchNewBiTurns({
        since: watermark,
        filter: this.options.filter,
        limit: this.batchLimit
      });

      let imported = 0;
      for (const raw of rawTurns) {
        const data = rawToTurnData(raw);
        const conversation = await this.repository.ensureConversation({
          sourceSessionId: data.sourceSessionId,
          chatSlug: data.chatSlug,
          userLabel: null,
          sourceCreatedAt: data.sourceCreatedAt
        });
        const turn = await this.repository.upsertTurn(conversation.id, data);
        if (turn.created) {
          await this.repository.incrementConversationTurnCount(conversation.id, data.sourceCreatedAt);
          imported += 1;
        }
      }

      const nextWatermark = computeWatermark(rawTurns, watermark);
      await this.repository.finishSyncRun(run.id, {
        status: "success",
        turnsImported: imported,
        watermark: nextWatermark,
        error: null
      });

      return { status: "success", turnsImported: imported, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha desconhecida na sincronizacao.";
      await this.repository.finishSyncRun(run.id, {
        status: "error",
        turnsImported: 0,
        watermark: null,
        error: message
      });
      return { status: "error", turnsImported: 0, error: message };
    }
  }
}
