import type { FastifyReply, FastifyRequest } from "fastify";

import { createSkillBodySchema, skillIdParamsSchema } from "./skill.schema.js";
import { SkillService } from "./skill.service.js";

export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  list = async (_request: FastifyRequest, reply: FastifyReply) => {
    const skills = await this.skillService.list();
    return reply.send(skills);
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = skillIdParamsSchema.parse(request.params);
    const skill = await this.skillService.getById(id);

    return reply.send(skill);
  };

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createSkillBodySchema.parse(request.body);
    const skill = await this.skillService.create(body);

    return reply.status(201).send(skill);
  };
}
