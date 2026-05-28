export type Domain = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type Metric = {
  id: string;
  domainId: string;
  domain: Domain;
  name: string;
  technicalKey: string;
  daxMeasure: string;
  unit?: string | null;
  description?: string | null;
  synonyms: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type Skill = {
  id: string;
  name: string;
  type: string;
  description?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type SemanticPlan = {
  intent: string;
  domain: Pick<Domain, "id" | "slug" | "name"> | null;
  metric: {
    id: string;
    technicalKey: string;
    name: string;
    unit?: string | null;
    daxMeasure: string;
  } | null;
  period: {
    raw: string;
    type: string;
    value: string;
  } | null;
  groupBy: string[];
  filters: string[];
  skillsSuggested: string[];
  confidence: number;
  needsClarification: boolean;
  explanation: string;
};

export type SemanticTest = {
  id: string;
  input: string;
  generatedPlan: SemanticPlan;
  confidence: number;
  needsClarification: boolean;
  createdAt: string;
};

export type DashboardStats = {
  domains: number;
  metrics: number;
  skills: number;
  semanticTests: number;
};
