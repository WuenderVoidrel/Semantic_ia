import type { FastifyReply, FastifyRequest } from "fastify";

import { EnrichService } from "./enrich.service.js";
import { TelemetryService } from "./telemetry.service.js";
import {
  telemetryEnrichBodySchema,
  telemetryTurnParamsSchema,
  telemetryTurnsQuerySchema
} from "./telemetry.schema.js";

export class TelemetryController {
  constructor(
    private readonly service: TelemetryService,
    private readonly enrichService: EnrichService
  ) {}

  getStats = async (_request: FastifyRequest, reply: FastifyReply) => {
    const stats = await this.service.getStats();
    return reply.send(stats);
  };

  listTurns = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = telemetryTurnsQuerySchema.parse(request.query);
    const result = await this.service.listTurns(query);
    return reply.send(result);
  };

  getTurn = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = telemetryTurnParamsSchema.parse(request.params);
    const turn = await this.service.getTurn(id);
    return reply.send(turn);
  };

  enrich = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = telemetryEnrichBodySchema.parse(request.body ?? {});
    const result = await this.enrichService.enrichPending(body.limit);
    return reply.send(result);
  };
}
