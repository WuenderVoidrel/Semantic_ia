import type { FastifyInstance } from "fastify";

import { DashboardController } from "./dashboard.controller.js";
import { DashboardRepository } from "./dashboard.repository.js";
import { DashboardService } from "./dashboard.service.js";

export async function dashboardRoutes(app: FastifyInstance) {
  const dashboardRepository = new DashboardRepository(app.prisma);
  const dashboardService = new DashboardService(dashboardRepository);
  const dashboardController = new DashboardController(dashboardService);

  app.get("/api/dashboard/stats", dashboardController.getStats);
}
