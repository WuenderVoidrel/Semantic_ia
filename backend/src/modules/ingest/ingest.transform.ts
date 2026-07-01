import type { RawBiTurn } from "../../shared/sources/helena-source.types.js";

export type TurnUpsertData = Omit<RawBiTurn, "question" | "metricsRequested" | "groupBy"> & {
  question: string;
  metricsRequested: unknown[];
  groupBy: unknown[];
};

export function normalizeJsonArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function rawToTurnData(raw: RawBiTurn): TurnUpsertData {
  return {
    ...raw,
    question: raw.question ?? "",
    metricsRequested: normalizeJsonArray(raw.metricsRequested),
    groupBy: normalizeJsonArray(raw.groupBy)
  };
}

export function computeWatermark(turns: RawBiTurn[], previous: Date | null): Date | null {
  return turns.reduce<Date | null>((max, turn) => {
    if (!max || turn.sourceCreatedAt.getTime() > max.getTime()) {
      return turn.sourceCreatedAt;
    }
    return max;
  }, previous);
}
