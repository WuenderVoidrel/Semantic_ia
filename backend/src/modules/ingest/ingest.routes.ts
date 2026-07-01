import type { FastifyInstance } from "fastify";

import { IngestController } from "./ingest.controller.js";
import { IngestRepository } from "./ingest.repository.js";

export async function ingestRoutes(app: FastifyInstance) {
  const repository = new IngestRepository(app.prisma);
  const controller = new IngestController(app.ingestService, repository);

  app.post("/api/ingest/sync", controller.sync);
  app.get("/api/ingest/status", controller.status);
}
