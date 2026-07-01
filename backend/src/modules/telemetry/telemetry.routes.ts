import type { FastifyInstance } from "fastify";

import { TelemetryController } from "./telemetry.controller.js";
import { TelemetryRepository } from "./telemetry.repository.js";
import { TelemetryService } from "./telemetry.service.js";

export async function telemetryRoutes(app: FastifyInstance) {
  const repository = new TelemetryRepository(app.prisma);
  const service = new TelemetryService(repository);
  const controller = new TelemetryController(service);

  app.get("/api/telemetry/stats", controller.getStats);
}
