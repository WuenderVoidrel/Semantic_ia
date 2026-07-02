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

export type SemanticDiagnostics = {
  matchedAliases: string[];
  unmatchedTokens: string[];
  candidateMetrics: Array<{
    id: string;
    name: string;
    technicalKey: string;
    domainSlug: string;
    score: number;
    matchedAliases: string[];
    metricNameMatch: boolean;
    domainDetected: boolean;
  }>;
  confidenceBreakdown: {
    synonym: number;
    metricName: number;
    period: number;
    groupBy: number;
    domain: number;
  };
  lowConfidenceReasons: string[];
};

export type SemanticAnalysis = {
  plan: SemanticPlan;
  diagnostics: SemanticDiagnostics;
  testId: string | null;
};

export type SemanticTest = {
  id: string;
  input: string;
  normalizedInput?: string | null;
  generatedPlan: SemanticPlan;
  confidence: number;
  needsClarification: boolean;
  resolvedDomainId?: string | null;
  resolvedMetricId?: string | null;
  periodValue?: string | null;
  groupBy?: string[] | null;
  hasDivergence?: boolean;
  helenaDomainSlug?: string | null;
  helenaMetricKey?: string | null;
  createdAt: string;
};

export type SemanticRelay = {
  targetUrl: string | null;
  forwarded: boolean;
  ok: boolean;
  status: number | null;
  response: unknown | null;
  error: string | null;
};

export type SemanticRelayResult = {
  input: string;
  plan: SemanticPlan;
  relay: SemanticRelay;
};

export type CatalogSuggestion = {
  id: string;
  semanticTestId?: string | null;
  type: string;
  status: string;
  metricId?: string | null;
  domainId?: string | null;
  suggestedAlias: string;
  normalizedAlias: string;
  evidence: unknown;
  confidence?: number | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
  createdAt: string;
  metric?: Metric | null;
  semanticTest?: SemanticTest | null;
};

export type GoldenCase = {
  id: string;
  semanticTestId: string;
  input: string;
  expectedDomainSlug?: string | null;
  expectedMetricKey?: string | null;
  expectedPeriodValue?: string | null;
  expectedGroupBy: string[];
  expectedNeedsClarification?: boolean | null;
  tags?: string[] | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DashboardStats = {
  domains: number;
  metrics: number;
  skills: number;
  semanticTests: number;
};

export type TelemetryStats = {
  totals: { turns: number; conversations: number; costUsd: number; totalTokens: number; avgLatencyMs: number; errorRate: number };
  latency: { p50: number; p95: number };
  byDomain: Array<{ domain: string; turns: number; costUsd: number; avgLatencyMs: number }>;
  feedback: { like: number; dislike: number; none: number };
  volumeByDay: Array<{ day: string; turns: number }>;
};

export type TelemetryTurn = {
  id: string;
  conversationId: string;
  sourceSessionId: string;
  sourceCreatedAt: string;
  importedAt: string;
  question: string;
  answer: string;
  domain: string | null;
  routingReason: string | null;
  confidence: number | null;
  metricsRequested: unknown;
  periodStart: string | null;
  periodEnd: string | null;
  groupBy: unknown;
  toolUsed: string | null;
  model: string | null;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  cachedTokens: number | null;
  costUsd: string | number | null;
  latencyMs: number | null;
  status: string | null;
  errorCode: string | null;
  verifierOk: boolean | null;
  feedbackRating: string | null;
  feedbackReason: string | null;
  studioPlan: SemanticPlan | { skipped: string } | null;
  studioDomain: string | null;
  studioMetricKey: string | null;
  studioConfidence: number | null;
  hasDivergence: boolean;
};

export type TelemetryTurnsResponse = {
  items: TelemetryTurn[];
  total: number;
  limit: number;
  offset: number;
};

export type TelemetryTurnsFilters = {
  limit?: number;
  offset?: number;
  domain?: string;
  feedback?: "like" | "dislike";
  divergence?: boolean;
};
