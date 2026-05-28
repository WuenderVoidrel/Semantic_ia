import type { FastifyReply, FastifyRequest } from "fastify";

import { generateSemanticPlanBodySchema, semanticHistoryQuerySchema } from "./semantic.schema.js";
import { SemanticService } from "./semantic.service.js";

export class SemanticController {
  constructor(private readonly semanticService: SemanticService) {}

  generatePlan = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = generateSemanticPlanBodySchema.parse(request.body);
    const plan = await this.semanticService.generatePlan(body);

    return reply.send(plan);
  };

  getHistory = async (request: FastifyRequest, reply: FastifyReply) => {
    const { limit } = semanticHistoryQuerySchema.parse(request.query);
    const history = await this.semanticService.getHistory(limit);

    return reply.send(history);
  };
}
