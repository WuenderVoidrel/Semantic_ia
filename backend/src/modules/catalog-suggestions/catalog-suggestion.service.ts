import { AppError } from "../../shared/errors/app-error.js";
import { normalizeText } from "../../shared/utils/normalize-text.js";

import type { ReviewSuggestionBody } from "./catalog-suggestion.schema.js";
import { CatalogSuggestionRepository } from "./catalog-suggestion.repository.js";

function getSynonyms(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export class CatalogSuggestionService {
  constructor(private readonly repository: CatalogSuggestionRepository) {}

  list(status: string) {
    return this.repository.findMany(status);
  }

  async approve(id: string, data: ReviewSuggestionBody) {
    const suggestion = await this.repository.findById(id);

    if (!suggestion) {
      throw new AppError("Sugestão não encontrada.", 404);
    }

    if (suggestion.status !== "pending") {
      throw new AppError("Apenas sugestões pendentes podem ser aprovadas.", 400);
    }

    if (!suggestion.metricId || !suggestion.metric) {
      throw new AppError("Sugestão sem métrica associada.", 400);
    }

    const synonyms = getSynonyms(suggestion.metric.synonyms);
    const alreadyExists = synonyms.some((alias) => normalizeText(alias) === suggestion.normalizedAlias);

    if (!alreadyExists) {
      await this.repository.updateMetricSynonyms(suggestion.metricId, [...synonyms, suggestion.suggestedAlias]);
    }

    return this.repository.updateStatus(id, "approved", data);
  }

  async reject(id: string, data: ReviewSuggestionBody) {
    const suggestion = await this.repository.findById(id);

    if (!suggestion) {
      throw new AppError("Sugestão não encontrada.", 404);
    }

    if (suggestion.status !== "pending") {
      throw new AppError("Apenas sugestões pendentes podem ser rejeitadas.", 400);
    }

    return this.repository.updateStatus(id, "rejected", data);
  }
}
