import { DashboardRepository } from "./dashboard.repository.js";

export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getStats() {
    return this.dashboardRepository.getStats();
  }
}
