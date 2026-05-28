import { randomUUID } from "node:crypto";

type DomainRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

type MetricRecord = {
  id: string;
  domainId: string;
  name: string;
  technicalKey: string;
  daxMeasure: string;
  unit: string | null;
  description: string | null;
  synonyms: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

type SkillRecord = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

type SemanticTestRecord = {
  id: string;
  input: string;
  generatedPlan: unknown;
  confidence: number;
  needsClarification: boolean;
  createdAt: Date;
};

function createTimestamp() {
  return new Date();
}

function sortByNameAsc<T extends { name: string }>(items: T[]) {
  return [...items].sort((first, second) => first.name.localeCompare(second.name, "pt-BR"));
}

function createSeedData() {
  const now = createTimestamp();

  const domains: DomainRecord[] = [
    {
      id: randomUUID(),
      name: "Agricola",
      slug: "agricola",
      description: "Indicadores gerais das operacoes agricolas.",
      status: "active",
      createdAt: now,
      updatedAt: now
    },
    {
      id: randomUUID(),
      name: "Plantio/Preparo",
      slug: "plantio-preparo",
      description: "Indicadores ligados ao preparo e ao plantio.",
      status: "active",
      createdAt: now,
      updatedAt: now
    },
    {
      id: randomUUID(),
      name: "Automotiva",
      slug: "automotiva",
      description: "Indicadores operacionais de frota e equipamentos.",
      status: "active",
      createdAt: now,
      updatedAt: now
    },
    {
      id: randomUUID(),
      name: "Materia-Prima",
      slug: "materia-prima",
      description: "Indicadores de recebimento e processamento de materia-prima.",
      status: "active",
      createdAt: now,
      updatedAt: now
    }
  ];

  const domainIdBySlug = new Map(domains.map((domain) => [domain.slug, domain.id]));

  const metrics: MetricRecord[] = [
    {
      id: randomUUID(),
      domainId: domainIdBySlug.get("materia-prima")!,
      name: "Moagem",
      technicalKey: "materia_prima.moagem_ton",
      daxMeasure: "[Moagem Ton]",
      unit: "t",
      description: "Volume total de cana moida.",
      synonyms: ["moagem", "moeu", "cana moida", "moagem do dia"],
      status: "active",
      createdAt: now,
      updatedAt: now
    },
    {
      id: randomUUID(),
      domainId: domainIdBySlug.get("automotiva")!,
      name: "Disponibilidade de Equipamentos",
      technicalKey: "automotiva.disponibilidade_equipamentos",
      daxMeasure: "[Disponibilidade Equipamentos]",
      unit: "%",
      description: "Disponibilidade operacional da frota e dos equipamentos.",
      synonyms: ["disponibilidade", "disp", "disponibilidade da frota", "equipamentos disponiveis"],
      status: "active",
      createdAt: now,
      updatedAt: now
    },
    {
      id: randomUUID(),
      domainId: domainIdBySlug.get("plantio-preparo")!,
      name: "Hectares Plantados",
      technicalKey: "plantio.hectares_plantio_diario",
      daxMeasure: "[Hectares Plantio Diario]",
      unit: "ha",
      description: "Area plantada no periodo consultado.",
      synonyms: ["hectares plantados", "plantio", "area plantada"],
      status: "active",
      createdAt: now,
      updatedAt: now
    },
    {
      id: randomUUID(),
      domainId: domainIdBySlug.get("agricola")!,
      name: "Entrada de Cana",
      technicalKey: "agricola.entrada_cana",
      daxMeasure: "[Toneladas Frentes]",
      unit: "t",
      description: "Toneladas de cana entregues pelas frentes.",
      synonyms: ["entrada de cana", "entrega", "toneladas", "cana entregue"],
      status: "active",
      createdAt: now,
      updatedAt: now
    }
  ];

  const skills: SkillRecord[] = [
    {
      id: randomUUID(),
      name: "metric-resolver",
      type: "semantic",
      description: "Resolve a metrica principal da pergunta.",
      status: "active",
      createdAt: now,
      updatedAt: now
    },
    {
      id: randomUUID(),
      name: "ranges-relativos",
      type: "temporal",
      description: "Interpreta periodos relativos como ontem e semana.",
      status: "active",
      createdAt: now,
      updatedAt: now
    },
    {
      id: randomUUID(),
      name: "turnos-rules",
      type: "grouping",
      description: "Aplica regras de agrupamento por turno.",
      status: "active",
      createdAt: now,
      updatedAt: now
    },
    {
      id: randomUUID(),
      name: "data-freshness",
      type: "validation",
      description: "Avalia indicios de atualizacao e defasagem.",
      status: "active",
      createdAt: now,
      updatedAt: now
    },
    {
      id: randomUUID(),
      name: "chart-recommendation",
      type: "presentation",
      description: "Sugere visualizacoes para a resposta.",
      status: "active",
      createdAt: now,
      updatedAt: now
    },
    {
      id: randomUUID(),
      name: "answer-verifier",
      type: "validation",
      description: "Confere coerencia basica do plano antes da resposta.",
      status: "active",
      createdAt: now,
      updatedAt: now
    }
  ];

  return {
    domains,
    metrics,
    skills,
    semanticTests: [] as SemanticTestRecord[]
  };
}

type MockStore = ReturnType<typeof createSeedData>;

export class MockPrismaClient {
  private readonly store: MockStore;
  readonly isMock = true;

  constructor() {
    this.store = createSeedData();
  }

  async $connect() {
    return undefined;
  }

  async $disconnect() {
    return undefined;
  }

  domain = {
    count: async () => this.store.domains.length,
    findMany: async () => sortByNameAsc(this.store.domains),
    findUnique: async ({ where }: { where: { id: string } }) =>
      this.store.domains.find((domain) => domain.id === where.id) ?? null,
    create: async ({
      data
    }: {
      data: { name: string; slug: string; description?: string; status: string };
    }) => {
      const now = createTimestamp();
      const created: DomainRecord = {
        id: randomUUID(),
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        status: data.status,
        createdAt: now,
        updatedAt: now
      };

      this.store.domains.push(created);
      return created;
    }
  };

  metric = {
    count: async () => this.store.metrics.length,
    findMany: async (args?: { where?: { status?: string }; include?: { domain?: boolean } }) => {
      const filtered = args?.where?.status
        ? this.store.metrics.filter((metric) => metric.status === args.where?.status)
        : this.store.metrics;

      const sorted = sortByNameAsc(filtered);

      if (args?.include?.domain) {
        return sorted.map((metric) => ({
          ...metric,
          domain: this.store.domains.find((domain) => domain.id === metric.domainId)!
        }));
      }

      return sorted;
    },
    findUnique: async (args: { where: { id: string }; include?: { domain?: boolean } }) => {
      const metric = this.store.metrics.find((item) => item.id === args.where.id);

      if (!metric) {
        return null;
      }

      if (args.include?.domain) {
        return {
          ...metric,
          domain: this.store.domains.find((domain) => domain.id === metric.domainId)!
        };
      }

      return metric;
    },
    create: async ({
      data,
      include
    }: {
      data: {
        domainId: string;
        name: string;
        technicalKey: string;
        daxMeasure: string;
        unit?: string;
        description?: string;
        synonyms: string[];
        status: string;
      };
      include?: { domain?: boolean };
    }) => {
      const now = createTimestamp();
      const created: MetricRecord = {
        id: randomUUID(),
        domainId: data.domainId,
        name: data.name,
        technicalKey: data.technicalKey,
        daxMeasure: data.daxMeasure,
        unit: data.unit ?? null,
        description: data.description ?? null,
        synonyms: data.synonyms,
        status: data.status,
        createdAt: now,
        updatedAt: now
      };

      this.store.metrics.push(created);

      if (include?.domain) {
        return {
          ...created,
          domain: this.store.domains.find((domain) => domain.id === created.domainId)!
        };
      }

      return created;
    }
  };

  skill = {
    count: async () => this.store.skills.length,
    findMany: async () => sortByNameAsc(this.store.skills),
    findUnique: async ({ where }: { where: { id: string } }) =>
      this.store.skills.find((skill) => skill.id === where.id) ?? null,
    create: async ({
      data
    }: {
      data: { name: string; type: string; description?: string; status: string };
    }) => {
      const now = createTimestamp();
      const created: SkillRecord = {
        id: randomUUID(),
        name: data.name,
        type: data.type,
        description: data.description ?? null,
        status: data.status,
        createdAt: now,
        updatedAt: now
      };

      this.store.skills.push(created);
      return created;
    }
  };

  semanticTest = {
    count: async () => this.store.semanticTests.length,
    create: async ({
      data
    }: {
      data: {
        input: string;
        generatedPlan: unknown;
        confidence: number;
        needsClarification: boolean;
      };
    }) => {
      const created: SemanticTestRecord = {
        id: randomUUID(),
        input: data.input,
        generatedPlan: data.generatedPlan,
        confidence: data.confidence,
        needsClarification: data.needsClarification,
        createdAt: createTimestamp()
      };

      this.store.semanticTests.push(created);
      return created;
    },
    findMany: async ({ take }: { orderBy: { createdAt: "desc" }; take: number }) =>
      [...this.store.semanticTests]
        .sort((first, second) => second.createdAt.getTime() - first.createdAt.getTime())
        .slice(0, take)
  };
}
