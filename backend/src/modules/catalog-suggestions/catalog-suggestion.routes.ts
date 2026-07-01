import type { FastifyInstance } from "fastify";

import { CatalogSuggestionController } from "./catalog-suggestion.controller.js";
import { CatalogSuggestionRepository } from "./catalog-suggestion.repository.js";
import { CatalogSuggestionService } from "./catalog-suggestion.service.js";

export async function catalogSuggestionRoutes(app: FastifyInstance) {
  const repository = new CatalogSuggestionRepository(app.prisma);
  const service = new CatalogSuggestionService(repository);
  const controller = new CatalogSuggestionController(service);

  app.get("/api/catalog-suggestions", controller.list);
  app.post("/api/catalog-suggestions/:id/approve", controller.approve);
  app.post("/api/catalog-suggestions/:id/reject", controller.reject);
}
