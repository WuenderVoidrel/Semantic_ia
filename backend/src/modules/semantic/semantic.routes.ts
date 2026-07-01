import type { FastifyInstance } from "fastify";

import { env } from "../../env.js";
import { SemanticController } from "./semantic.controller.js";
import { SemanticRepository } from "./semantic.repository.js";
import { SemanticService } from "./semantic.service.js";

export async function semanticRoutes(app: FastifyInstance) {
  const semanticRepository = new SemanticRepository(app.prisma);
  const semanticService = new SemanticService(semanticRepository, {
    relayUrl: env.HELENA_ROUTER_URL,
    relayTimeoutMs: env.HELENA_RELAY_TIMEOUT_MS
  });
  const semanticController = new SemanticController(semanticService);

  app.post("/api/semantic/analyze", semanticController.analyze);
  app.post("/api/semantic/plan", semanticController.generatePlan);
  app.post("/api/semantic/relay", semanticController.relayPlan);
  app.get("/api/semantic/history", semanticController.getHistory);
}
