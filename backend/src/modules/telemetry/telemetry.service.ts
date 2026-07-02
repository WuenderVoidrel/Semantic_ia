import { AppError } from "../../shared/errors/app-error.js";
import { computeTelemetryStats, type StatTurn } from "./telemetry.stats.js";
import { TelemetryRepository, type TurnListFilters } from "./telemetry.repository.js";

export class TelemetryService {
  constructor(private readonly repository: TelemetryRepository) {}

  async getStats() {
    const [turns, conversations] = await Promise.all([
      this.repository.getTurnsForStats(),
      this.repository.countConversations()
    ]);

    const normalized: StatTurn[] = (turns as Array<Record<string, unknown>>).map((t) => ({
      domain: (t.domain as string | null) ?? null,
      costUsd: t.costUsd === null || t.costUsd === undefined ? null : Number(t.costUsd),
      totalTokens: (t.totalTokens as number | null) ?? null,
      latencyMs: (t.latencyMs as number | null) ?? null,
      status: (t.status as string | null) ?? null,
      errorCode: (t.errorCode as string | null) ?? null,
      feedbackRating: (t.feedbackRating as string | null) ?? null,
      sourceCreatedAt: t.sourceCreatedAt instanceof Date ? (t.sourceCreatedAt as Date) : new Date(String(t.sourceCreatedAt))
    }));

    return computeTelemetryStats(normalized, conversations);
  }

  async listTurns(filters: TurnListFilters) {
    const [items, total] = await Promise.all([
      this.repository.listTurns(filters),
      this.repository.countTurns(filters)
    ]);

    return { items, total, limit: filters.limit, offset: filters.offset };
  }

  async getTurn(id: string) {
    const turn = await this.repository.getTurn(id);

    if (!turn) {
      throw new AppError("Turno nao encontrado.", 404);
    }

    return turn;
  }
}
