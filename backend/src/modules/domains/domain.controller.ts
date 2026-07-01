import type { FastifyReply, FastifyRequest } from "fastify";

import { createDomainBodySchema, domainIdParamsSchema } from "./domain.schema.js";
import { DomainService } from "./domain.service.js";

export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  list = async (_request: FastifyRequest, reply: FastifyReply) => {
    const domains = await this.domainService.list();
    return reply.send(domains);
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = domainIdParamsSchema.parse(request.params);
    const domain = await this.domainService.getById(id);

    return reply.send(domain);
  };

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createDomainBodySchema.parse(request.body);
    const domain = await this.domainService.create(body);

    return reply.status(201).send(domain);
  };
}
