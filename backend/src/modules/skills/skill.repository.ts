import type { AppDatabaseClient } from "../../shared/types/database-client.js";

import type { CreateSkillBody } from "./skill.schema.js";

export class SkillRepository {
  constructor(private readonly prisma: AppDatabaseClient) {}

  findMany() {
    return this.prisma.skill.findMany({
      orderBy: { name: "asc" }
    });
  }

  findById(id: string) {
    return this.prisma.skill.findUnique({
      where: { id }
    });
  }

  create(data: CreateSkillBody) {
    return this.prisma.skill.create({
      data
    });
  }
}
