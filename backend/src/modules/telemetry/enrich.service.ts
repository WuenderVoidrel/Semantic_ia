import type { Prisma } from "@prisma/client";

import { SemanticService } from "../semantic/semantic.service.js";
import { TelemetryRepository } from "./telemetry.repository.js";

type JsonInput = Prisma.InputJsonValue;

const MAX_SUGGESTIONS_PER_TURN = 3;
const MIN_QUESTION_LENGTH = 3;

type EnrichResult = {
  processed: number;
  divergences: number;
  suggestions: number;
};

type PendingTurn = {
  id: string;
  question: string;
  domain: string | null;
};

export class EnrichService {
  constructor(
    private readonly repository: TelemetryRepository,
    private readonly semanticService: SemanticService
  ) {}

  async enrichPending(limit = 200): Promise<EnrichResult> {
    const turns = (await this.repository.findUnenriched(limit)) as PendingTurn[];
    let divergences = 0;
    let suggestions = 0;

    for (const turn of turns) {
      const question = (turn.question ?? "").trim();

      if (question.length < MIN_QUESTION_LENGTH) {
        await this.repository.updateEnrichment(turn.id, {
          studioPlan: { skipped: "pergunta muito curta para analise" } as JsonInput,
          studioDomain: null,
          studioMetricKey: null,
          studioConfidence: 0,
          hasDivergence: false
        });
        continue;
      }

      const { plan, diagnostics } = await this.semanticService.analyze({ input: question }, { persist: false });
      const studioDomain = plan.domain?.slug ?? null;
      const hasDivergence = Boolean(turn.domain && studioDomain && turn.domain !== studioDomain);

      await this.repository.updateEnrichment(turn.id, {
        studioPlan: plan as unknown as JsonInput,
        studioDomain,
        studioMetricKey: plan.metric?.technicalKey ?? null,
        studioConfidence: plan.confidence,
        hasDivergence
      });

      if (hasDivergence) {
        divergences += 1;
      }

      const candidate = diagnostics.candidateMetrics[0];
      if (candidate && diagnostics.unmatchedTokens.length > 0) {
        for (const token of diagnostics.unmatchedTokens.slice(0, MAX_SUGGESTIONS_PER_TURN)) {
          const result = await this.repository.createAliasSuggestion({
            metricId: candidate.id,
            suggestedAlias: token,
            normalizedAlias: token,
            evidence: {
              question,
              plan,
              sourceTurnId: turn.id,
              reason: "Termo sem match apareceu em pergunta real da Helena."
            } as unknown as JsonInput,
            confidence: plan.confidence
          });
          if (result.created) {
            suggestions += 1;
          }
        }
      }
    }

    return { processed: turns.length, divergences, suggestions };
  }
}
