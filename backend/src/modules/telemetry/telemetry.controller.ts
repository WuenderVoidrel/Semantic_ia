import type { FastifyReply, FastifyRequest } from "fastify";

import { TelemetryService } from "./telemetry.service.js";

export class TelemetryController {
  constructor(private readonly service: TelemetryService) {}

  getStats = async (_request: FastifyRequest, reply: FastifyReply) => {
    const stats = await this.service.getStats();
    return reply.send(stats);
  };
}
