import { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";

import { env } from "../env.js";
import { MockPrismaClient } from "../shared/mocks/mock-prisma.js";
import type { AppDatabaseClient } from "../shared/types/database-client.js";

export async function registerPrisma(app: FastifyInstance) {
  const prisma: AppDatabaseClient = env.DISABLE_DATABASE ? new MockPrismaClient() : new PrismaClient();

  await prisma.$connect();
  app.decorate("prisma", prisma as never);

  app.addHook("onClose", async (instance) => {
    await instance.prisma.$disconnect();
  });
}
