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
  normalizedInput: string | null;
  generatedPlan: unknown;
  confidence: number;
  needsClarification: boolean;
  resolvedDomainId: string | null;
  resolvedMetricId: string | null;
  periodValue: string | null;
  groupBy: unknown;
  relayResult: unknown;
  helenaDomainSlug: string | null;
  helenaMetricKey: string | null;
  hasDivergence: boolean;
  createdAt: Date;
};

type SemanticTokenMissRecord = {
  id: string;
  semanticTestId: string;
  token: string;
  normalizedToken: string;
  reason: string;
  createdAt: Date;
};

type CatalogSuggestionRecord = {
  id: string;
  semanticTestId: string | null;
  type: string;
  status: string;
  metricId: string | null;
  domainId: string | null;
  suggestedAlias: string;
  normalizedAlias: string;
  evidence: unknown;
  confidence: number | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  reviewNote: string | null;
  createdAt: Date;
};

type GoldenCaseRecord = {
  id: string;
  semanticTestId: string;
  input: string;
  expectedDomainSlug: string | null;
  expectedMetricKey: string | null;
  expectedPeriodValue: string | null;
  expectedGroupBy: unknown;
  expectedNeedsClarification: boolean | null;
  tags: unknown;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
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
      domainId: domainIdBySlug.get("agricola")!,
      name: "Moagem",
      technicalKey: "agricola.moagem",
      daxMeasure: "[Moagem]",
      unit: "t",
      description: "Volume total de cana moida.",
      synonyms: ["moagem", "moeu", "cana moida", "moagem do dia", "moagem agricola"],
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
    { id: randomUUID(), name: "metric-resolver", type: "semantic", description: "Resolve a metrica principal da pergunta.", status: "active", createdAt: now, updatedAt: now },
    { id: randomUUID(), name: "ranges-relativos", type: "temporal", description: "Interpreta periodos relativos como ontem e semana.", status: "active", createdAt: now, updatedAt: now },
    { id: randomUUID(), name: "turnos-rules", type: "grouping", description: "Aplica regras de agrupamento por turno.", status: "active", createdAt: now, updatedAt: now },
    { id: randomUUID(), name: "data-freshness", type: "validation", description: "Avalia indicios de atualizacao e defasagem.", status: "active", createdAt: now, updatedAt: now },
    { id: randomUUID(), name: "chart-recommendation", type: "presentation", description: "Sugere visualizacoes para a resposta.", status: "active", createdAt: now, updatedAt: now },
    { id: randomUUID(), name: "answer-verifier", type: "validation", description: "Confere coerencia basica do plano antes da resposta.", status: "active", createdAt: now, updatedAt: now }
  ];

  return {
    domains,
    metrics,
    skills,
    semanticTests: [] as SemanticTestRecord[],
    semanticTokenMisses: [] as SemanticTokenMissRecord[],
    catalogSuggestions: [] as CatalogSuggestionRecord[],
    goldenCases: [] as GoldenCaseRecord[]
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

  private metricWithDomain(metric: MetricRecord) {
    return {
      ...metric,
      domain: this.store.domains.find((domain) => domain.id === metric.domainId)!
    };
  }

  domain = {
    count: async () => this.store.domains.length,
    findMany: async () => sortByNameAsc(this.store.domains),
    findUnique: async ({ where }: { where: { id: string } }) =>
      this.store.domains.find((domain) => domain.id === where.id) ?? null,
    create: async ({ data }: { data: { name: string; slug: string; description?: string; status: string } }) => {
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

      return args?.include?.domain ? sorted.map((metric) => this.metricWithDomain(metric)) : sorted;
    },
    findUnique: async (args: { where: { id: string }; include?: { domain?: boolean } }) => {
      const metric = this.store.metrics.find((item) => item.id === args.where.id);

      if (!metric) {
        return null;
      }

      return args.include?.domain ? this.metricWithDomain(metric) : metric;
    },
    create: async ({ data, include }: { data: { domainId: string; name: string; technicalKey: string; daxMeasure: string; unit?: string; description?: string; synonyms: string[]; status: string }; include?: { domain?: boolean } }) => {
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
      return include?.domain ? this.metricWithDomain(created) : created;
    },
    update: async ({ where, data }: { where: { id: string }; data: { synonyms?: unknown } }) => {
      const metric = this.store.metrics.find((item) => item.id === where.id);

      if (!metric) {
        throw new Error("Metric not found");
      }

      if (Array.isArray(data.synonyms)) {
        metric.synonyms = data.synonyms.filter((item): item is string => typeof item === "string");
      }

      metric.updatedAt = createTimestamp();
      return metric;
    }
  };

  skill = {
    count: async () => this.store.skills.length,
    findMany: async () => sortByNameAsc(this.store.skills),
    findUnique: async ({ where }: { where: { id: string } }) =>
      this.store.skills.find((skill) => skill.id === where.id) ?? null,
    create: async ({ data }: { data: { name: string; type: string; description?: string; status: string } }) => {
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
    create: async ({ data }: { data: Partial<SemanticTestRecord> & { input: string; generatedPlan: unknown; confidence: number; needsClarification: boolean } }) => {
      const created: SemanticTestRecord = {
        id: randomUUID(),
        input: data.input,
        normalizedInput: data.normalizedInput ?? null,
        generatedPlan: data.generatedPlan,
        confidence: data.confidence,
        needsClarification: data.needsClarification,
        resolvedDomainId: data.resolvedDomainId ?? null,
        resolvedMetricId: data.resolvedMetricId ?? null,
        periodValue: data.periodValue ?? null,
        groupBy: data.groupBy ?? null,
        relayResult: data.relayResult ?? null,
        helenaDomainSlug: data.helenaDomainSlug ?? null,
        helenaMetricKey: data.helenaMetricKey ?? null,
        hasDivergence: data.hasDivergence ?? false,
        createdAt: createTimestamp()
      };

      this.store.semanticTests.push(created);
      return created;
    },
    findMany: async ({ take }: { orderBy: { createdAt: "desc" }; take: number }) =>
      [...this.store.semanticTests]
        .sort((first, second) => second.createdAt.getTime() - first.createdAt.getTime())
        .slice(0, take),
    findUnique: async ({ where }: { where: { id: string } }) =>
      this.store.semanticTests.find((item) => item.id === where.id) ?? null,
    update: async ({ where, data }: { where: { id: string }; data: Partial<SemanticTestRecord> }) => {
      const test = this.store.semanticTests.find((item) => item.id === where.id);

      if (!test) {
        throw new Error("Semantic test not found");
      }

      Object.assign(test, data);
      return test;
    }
  };

  semanticTokenMiss = {
    create: async ({ data }: { data: Omit<SemanticTokenMissRecord, "id" | "createdAt"> }) => {
      const created: SemanticTokenMissRecord = { id: randomUUID(), createdAt: createTimestamp(), ...data };
      this.store.semanticTokenMisses.push(created);
      return created;
    }
  };

  catalogSuggestion = {
    findFirst: async ({ where }: { where: { status?: string; metricId?: string; normalizedAlias?: string } }) =>
      this.store.catalogSuggestions.find((item) =>
        (!where.status || item.status === where.status) &&
        (!where.metricId || item.metricId === where.metricId) &&
        (!where.normalizedAlias || item.normalizedAlias === where.normalizedAlias)
      ) ?? null,
    create: async ({ data }: { data: Omit<CatalogSuggestionRecord, "id" | "createdAt" | "reviewedAt" | "reviewedBy" | "reviewNote"> & Partial<Pick<CatalogSuggestionRecord, "reviewedAt" | "reviewedBy" | "reviewNote">> }) => {
      const created: CatalogSuggestionRecord = {
        id: randomUUID(),
        semanticTestId: data.semanticTestId ?? null,
        type: data.type,
        status: data.status,
        metricId: data.metricId ?? null,
        domainId: data.domainId ?? null,
        suggestedAlias: data.suggestedAlias,
        normalizedAlias: data.normalizedAlias,
        evidence: data.evidence,
        confidence: data.confidence ?? null,
        reviewedBy: data.reviewedBy ?? null,
        reviewedAt: data.reviewedAt ?? null,
        reviewNote: data.reviewNote ?? null,
        createdAt: createTimestamp()
      };

      this.store.catalogSuggestions.push(created);
      return created;
    },
    findMany: async (args?: { where?: { status?: string }; include?: { metric?: { include?: { domain?: boolean } }; semanticTest?: boolean }; orderBy?: { createdAt: "desc" } }) => {
      const filtered = args?.where?.status
        ? this.store.catalogSuggestions.filter((item) => item.status === args.where?.status)
        : this.store.catalogSuggestions;
      const sorted = [...filtered].sort((first, second) => second.createdAt.getTime() - first.createdAt.getTime());

      return sorted.map((item) => ({
        ...item,
        metric: args?.include?.metric && item.metricId
          ? this.store.metrics.find((metric) => metric.id === item.metricId) ?? null
          : undefined,
        semanticTest: args?.include?.semanticTest && item.semanticTestId
          ? this.store.semanticTests.find((test) => test.id === item.semanticTestId) ?? null
          : undefined
      }));
    },
    findUnique: async ({ where, include }: { where: { id: string }; include?: { metric?: boolean } }) => {
      const item = this.store.catalogSuggestions.find((suggestion) => suggestion.id === where.id);

      if (!item) {
        return null;
      }

      return {
        ...item,
        metric: include?.metric && item.metricId ? this.store.metrics.find((metric) => metric.id === item.metricId) ?? null : undefined
      };
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<CatalogSuggestionRecord> }) => {
      const item = this.store.catalogSuggestions.find((suggestion) => suggestion.id === where.id);

      if (!item) {
        throw new Error("Catalog suggestion not found");
      }

      Object.assign(item, data);
      return item;
    }
  };

  goldenCase = {
    upsert: async ({ where, create, update }: { where: { semanticTestId: string }; create: Omit<GoldenCaseRecord, "id" | "createdAt" | "updatedAt">; update: Partial<GoldenCaseRecord> }) => {
      const existing = this.store.goldenCases.find((item) => item.semanticTestId === where.semanticTestId);
      const now = createTimestamp();

      if (existing) {
        Object.assign(existing, update, { updatedAt: now });
        return existing;
      }

      const created: GoldenCaseRecord = {
        id: randomUUID(),
        createdAt: now,
        updatedAt: now,
        ...create
      };

      this.store.goldenCases.push(created);
      return created;
    },
    findMany: async () => [...this.store.goldenCases].sort((first, second) => second.createdAt.getTime() - first.createdAt.getTime())
  };
}
