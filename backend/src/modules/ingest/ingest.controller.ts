import type { FastifyReply, FastifyRequest } from "fastify";

import { IngestRepository } from "./ingest.repository.js";
import { IngestService } from "./ingest.service.js";
import { syncStatusQuerySchema } from "./ingest.schema.js";

export class IngestController {
  constructor(
    private readonly service: IngestService,
    private readonly repository: IngestRepository
  ) {}

  sync = async (_request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.runSync("manual");
    return reply.send(result);
  };

  status = async (request: FastifyRequest, reply: FastifyReply) => {
    const { limit } = syncStatusQuerySchema.parse(request.query);
    const [runs, watermark] = await Promise.all([
      this.repository.listRecentSyncRuns(limit),
      this.repository.getLastWatermark()
    ]);
    return reply.send({ runs, watermark });
  };
}
