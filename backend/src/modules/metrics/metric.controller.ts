import type { FastifyReply, FastifyRequest } from "fastify";

import { createMetricBodySchema, metricIdParamsSchema } from "./metric.schema.js";
import { MetricService } from "./metric.service.js";

export class MetricController {
  constructor(private readonly metricService: MetricService) {}

  list = async (_request: FastifyRequest, reply: FastifyReply) => {
    const metrics = await this.metricService.list();
    return reply.send(metrics);
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = metricIdParamsSchema.parse(request.params);
    const metric = await this.metricService.getById(id);

    return reply.send(metric);
  };

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createMetricBodySchema.parse(request.body);
    const metric = await this.metricService.create(body);

    return reply.status(201).send(metric);
  };
}
