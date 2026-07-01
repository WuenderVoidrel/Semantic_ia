import type { FastifyReply, FastifyRequest } from "fastify";

import { semanticTestIdParamsSchema, updateGoldenCaseBodySchema } from "./golden-case.schema.js";
import { GoldenCaseService } from "./golden-case.service.js";

export class GoldenCaseController {
  constructor(private readonly service: GoldenCaseService) {}

  createFromTest = async (request: FastifyRequest, reply: FastifyReply) => {
    const { semanticTestId } = semanticTestIdParamsSchema.parse(request.params);
    const body = updateGoldenCaseBodySchema.parse(request.body ?? {});
    const goldenCase = await this.service.createFromTest(semanticTestId, body);

    return reply.status(201).send(goldenCase);
  };

  list = async (_request: FastifyRequest, reply: FastifyReply) => {
    const cases = await this.service.list();
    return reply.send(cases);
  };

  export = async (_request: FastifyRequest, reply: FastifyReply) => {
    const cases = await this.service.export();
    return reply.send(cases);
  };
}
