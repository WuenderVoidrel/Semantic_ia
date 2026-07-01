import type { FastifyReply, FastifyRequest } from "fastify";

import {
  analyzeSemanticBodySchema,
  generateSemanticPlanBodySchema,
  relaySemanticPlanBodySchema,
  semanticHistoryQuerySchema
} from "./semantic.schema.js";
import { SemanticService } from "./semantic.service.js";

export class SemanticController {
  constructor(private readonly semanticService: SemanticService) {}

  analyze = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = analyzeSemanticBodySchema.parse(request.body);
    const shouldPersist = Boolean(body.sessionId || body.source === "helena");
    const result = await this.semanticService.analyze({ input: body.input }, { persist: shouldPersist });

    return reply.send({
      ...result,
      persisted: shouldPersist,
      source: shouldPersist ? body.source ?? "helena" : "preview",
      sessionId: body.sessionId ?? null
    });
  };

  generatePlan = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = generateSemanticPlanBodySchema.parse(request.body);
    const plan = await this.semanticService.generatePlan(body);

    return reply.send(plan);
  };

  relayPlan = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = relaySemanticPlanBodySchema.parse(request.body);
    const result = await this.semanticService.relayPlan(body);

    return reply.send(result);
  };

  getHistory = async (request: FastifyRequest, reply: FastifyReply) => {
    const { limit } = semanticHistoryQuerySchema.parse(request.query);
    const history = await this.semanticService.getHistory(limit);

    return reply.send(history);
  };
}
