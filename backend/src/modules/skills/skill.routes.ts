import type { FastifyInstance } from "fastify";

import { SkillController } from "./skill.controller.js";
import { SkillRepository } from "./skill.repository.js";
import { SkillService } from "./skill.service.js";

export async function skillRoutes(app: FastifyInstance) {
  const skillRepository = new SkillRepository(app.prisma);
  const skillService = new SkillService(skillRepository);
  const skillController = new SkillController(skillService);

  app.get("/api/skills", skillController.list);
  app.get("/api/skills/:id", skillController.getById);
  app.post("/api/skills", skillController.create);
}
