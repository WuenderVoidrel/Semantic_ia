import type { FastifyInstance } from "fastify";

import { MetricController } from "./metric.controller.js";
import { MetricRepository } from "./metric.repository.js";
import { MetricService } from "./metric.service.js";

export async function metricRoutes(app: FastifyInstance) {
  const metricRepository = new MetricRepository(app.prisma);
  const metricService = new MetricService(metricRepository);
  const metricController = new MetricController(metricService);

  app.get("/api/metrics", metricController.list);
  app.get("/api/metrics/:id", metricController.getById);
  app.post("/api/metrics", metricController.create);
}
