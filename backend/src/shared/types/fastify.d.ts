import type { AppDatabaseClient } from "./database-client.js";

declare module "fastify" {
  interface FastifyInstance {
    prisma: AppDatabaseClient;
  }
}

export {};
