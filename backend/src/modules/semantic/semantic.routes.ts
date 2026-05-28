import type { FastifyInstance } from "fastify";

import { SemanticController } from "./semantic.controller.js";
import { SemanticRepository } from "./semantic.repository.js";
import { SemanticService } from "./semantic.service.js";

export async function semanticRoutes(app: FastifyInstance) {
  const semanticRepository = new SemanticRepository(app.prisma);
  const semanticService = new SemanticService(semanticRepository);
  const semanticController = new SemanticController(semanticService);

  app.post("/api/semantic/plan", semanticController.generatePlan);
  app.get("/api/semantic/history", semanticController.getHistory);
}
