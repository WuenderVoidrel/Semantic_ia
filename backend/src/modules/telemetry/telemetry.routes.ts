import type { FastifyInstance } from "fastify";

import { SemanticRepository } from "../semantic/semantic.repository.js";
import { SemanticService } from "../semantic/semantic.service.js";
import { EnrichService } from "./enrich.service.js";
import { TelemetryController } from "./telemetry.controller.js";
import { TelemetryRepository } from "./telemetry.repository.js";
import { TelemetryService } from "./telemetry.service.js";

export async function telemetryRoutes(app: FastifyInstance) {
  const repository = new TelemetryRepository(app.prisma);
  const service = new TelemetryService(repository);
  const semanticService = new SemanticService(new SemanticRepository(app.prisma));
  const enrichService = new EnrichService(repository, semanticService);
  const controller = new TelemetryController(service, enrichService);

  app.get("/api/telemetry/stats", controller.getStats);
  app.get("/api/telemetry/turns", controller.listTurns);
  app.get("/api/telemetry/turns/:id", controller.getTurn);
  app.post("/api/telemetry/enrich", controller.enrich);
}
