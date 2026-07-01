import type { AppDatabaseClient } from "../../shared/types/database-client.js";

import type { CreateDomainBody } from "./domain.schema.js";

export class DomainRepository {
  constructor(private readonly prisma: AppDatabaseClient) {}

  findMany() {
    return this.prisma.domain.findMany({
      orderBy: { name: "asc" }
    });
  }

  findById(id: string) {
    return this.prisma.domain.findUnique({
      where: { id }
    });
  }

  create(data: CreateDomainBody) {
    return this.prisma.domain.create({
      data
    });
  }
}
