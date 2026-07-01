import { AppError } from "../../shared/errors/app-error.js";

import type { CreateMetricBody } from "./metric.schema.js";
import { MetricRepository } from "./metric.repository.js";

export class MetricService {
  constructor(private readonly metricRepository: MetricRepository) {}

  list() {
    return this.metricRepository.findMany();
  }

  async getById(id: string) {
    const metric = await this.metricRepository.findById(id);

    if (!metric) {
      throw new AppError("Metrica nao encontrada.", 404);
    }

    return metric;
  }

  create(data: CreateMetricBody) {
    return this.metricRepository.create(data);
  }
}
