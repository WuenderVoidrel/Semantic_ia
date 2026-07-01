import type { FastifyInstance } from "fastify";

import { GoldenCaseController } from "./golden-case.controller.js";
import { GoldenCaseRepository } from "./golden-case.repository.js";
import { GoldenCaseService } from "./golden-case.service.js";

export async function goldenCaseRoutes(app: FastifyInstance) {
  const repository = new GoldenCaseRepository(app.prisma);
  const service = new GoldenCaseService(repository);
  const controller = new GoldenCaseController(service);

  app.post("/api/golden-cases/from-test/:semanticTestId", controller.createFromTest);
  app.get("/api/golden-cases", controller.list);
  app.get("/api/golden-cases/export", controller.export);
}
