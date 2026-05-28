import type { PrismaClient } from "@prisma/client";

import type { MockPrismaClient } from "../mocks/mock-prisma.js";

export type AppDatabaseClient = PrismaClient | MockPrismaClient;
