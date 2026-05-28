import { AppError } from "../../shared/errors/app-error.js";

import type { CreateDomainBody } from "./domain.schema.js";
import { DomainRepository } from "./domain.repository.js";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export class DomainService {
  constructor(private readonly domainRepository: DomainRepository) {}

  list() {
    return this.domainRepository.findMany();
  }

  async getById(id: string) {
    const domain = await this.domainRepository.findById(id);

    if (!domain) {
      throw new AppError("Dominio nao encontrado.", 404);
    }

    return domain;
  }

  create(data: CreateDomainBody) {
    return this.domainRepository.create({
      ...data,
      slug: slugify(data.slug)
    });
  }
}
