import type { FastifyReply, FastifyRequest } from "fastify";

import {
  reviewSuggestionBodySchema,
  suggestionIdParamsSchema,
  suggestionListQuerySchema
} from "./catalog-suggestion.schema.js";
import { CatalogSuggestionService } from "./catalog-suggestion.service.js";

export class CatalogSuggestionController {
  constructor(private readonly service: CatalogSuggestionService) {}

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const { status } = suggestionListQuerySchema.parse(request.query);
    const suggestions = await this.service.list(status);

    return reply.send(suggestions);
  };

  approve = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = suggestionIdParamsSchema.parse(request.params);
    const body = reviewSuggestionBodySchema.parse(request.body ?? {});
    const suggestion = await this.service.approve(id, body);

    return reply.send(suggestion);
  };

  reject = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = suggestionIdParamsSchema.parse(request.params);
    const body = reviewSuggestionBodySchema.parse(request.body ?? {});
    const suggestion = await this.service.reject(id, body);

    return reply.send(suggestion);
  };
}
