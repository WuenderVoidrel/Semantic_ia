import type { FastifyInstance } from "fastify";

import { DomainController } from "./domain.controller.js";
import { DomainRepository } from "./domain.repository.js";
import { DomainService } from "./domain.service.js";

export async function domainRoutes(app: FastifyInstance) {
  const domainRepository = new DomainRepository(app.prisma);
  const domainService = new DomainService(domainRepository);
  const domainController = new DomainController(domainService);

  app.get("/api/domains", domainController.list);
  app.get("/api/domains/:id", domainController.getById);
  app.post("/api/domains", domainController.create);
}
