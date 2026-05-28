import type { AppDatabaseClient } from "../../shared/types/database-client.js";

import type { CreateMetricBody } from "./metric.schema.js";

export class MetricRepository {
  constructor(private readonly prisma: AppDatabaseClient) {}

  findMany() {
    return this.prisma.metric.findMany({
      include: { domain: true },
      orderBy: { name: "asc" }
    });
  }

  findById(id: string) {
    return this.prisma.metric.findUnique({
      where: { id },
      include: { domain: true }
    });
  }

  create(data: CreateMetricBody) {
    return this.prisma.metric.create({
      data,
      include: { domain: true }
    });
  }
}
