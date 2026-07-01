import { AppError } from "../../shared/errors/app-error.js";

import type { CreateSkillBody } from "./skill.schema.js";
import { SkillRepository } from "./skill.repository.js";

export class SkillService {
  constructor(private readonly skillRepository: SkillRepository) {}

  list() {
    return this.skillRepository.findMany();
  }

  async getById(id: string) {
    const skill = await this.skillRepository.findById(id);

    if (!skill) {
      throw new AppError("Skill nao encontrada.", 404);
    }

    return skill;
  }

  create(data: CreateSkillBody) {
    return this.skillRepository.create(data);
  }
}
