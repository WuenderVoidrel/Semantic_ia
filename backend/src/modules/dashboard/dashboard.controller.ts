import type { FastifyReply, FastifyRequest } from "fastify";

import { DashboardService } from "./dashboard.service.js";

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  getStats = async (_request: FastifyRequest, reply: FastifyReply) => {
    const stats = await this.dashboardService.getStats();

    return reply.send(stats);
  };
}
