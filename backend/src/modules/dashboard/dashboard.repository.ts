import type { AppDatabaseClient } from "../../shared/types/database-client.js";

export class DashboardRepository {
  constructor(private readonly prisma: AppDatabaseClient) {}

  async getStats() {
    const [domains, metrics, skills, semanticTests] = await Promise.all([
      this.prisma.domain.count(),
      this.prisma.metric.count(),
      this.prisma.skill.count(),
      this.prisma.semanticTest.count()
    ]);

    return { domains, metrics, skills, semanticTests };
  }
}
