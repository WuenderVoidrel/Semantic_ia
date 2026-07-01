import type { AppDatabaseClient } from "../../shared/types/database-client.js";

export class TelemetryRepository {
  constructor(private readonly prisma: AppDatabaseClient) {}

  getTurnsForStats() {
    return this.prisma.helenaTurn.findMany({});
  }

  countConversations() {
    return this.prisma.helenaConversation.count();
  }
}
