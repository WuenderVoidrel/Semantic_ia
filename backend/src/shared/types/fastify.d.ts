import type { AppDatabaseClient } from "./database-client.js";

declare module "fastify" {
  interface FastifyInstance {
    prisma: AppDatabaseClient;
    ingestService: import("../../modules/ingest/ingest.service.js").IngestService;
  }
}

export {};
