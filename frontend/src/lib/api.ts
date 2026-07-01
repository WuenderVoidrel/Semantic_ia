import type {
  CatalogSuggestion,
  DashboardStats,
  Domain,
  GoldenCase,
  Metric,
  SemanticAnalysis,
  SemanticPlan,
  SemanticRelayResult,
  SemanticTest,
  Skill
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    let message = "Nao foi possivel concluir a requisicao.";

    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) {
        message = body.message;
      }
    } catch {}

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function getDomains() {
  return apiFetch<Domain[]>("/api/domains");
}

export function getMetrics() {
  return apiFetch<Metric[]>("/api/metrics");
}

export function getSkills() {
  return apiFetch<Skill[]>("/api/skills");
}

export function getDashboardStats() {
  return apiFetch<DashboardStats>("/api/dashboard/stats");
}

export function analyzeSemanticInput(input: string) {
  return apiFetch<SemanticAnalysis>("/api/semantic/analyze", {
    method: "POST",
    body: JSON.stringify({ input })
  });
}

export function generateSemanticPlan(input: string) {
  return apiFetch<SemanticPlan>("/api/semantic/plan", {
    method: "POST",
    body: JSON.stringify({ input })
  });
}

export function relaySemanticPlan(input: string, sessionId?: string) {
  return apiFetch<SemanticRelayResult>("/api/semantic/relay", {
    method: "POST",
    body: JSON.stringify({ input, sessionId })
  });
}

export function getSemanticHistory(limit = 20) {
  return apiFetch<SemanticTest[]>(`/api/semantic/history?limit=${limit}`);
}

export function getCatalogSuggestions(status = "pending") {
  return apiFetch<CatalogSuggestion[]>(`/api/catalog-suggestions?status=${status}`);
}

export function approveCatalogSuggestion(id: string) {
  return apiFetch<CatalogSuggestion>(`/api/catalog-suggestions/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({ reviewedBy: "semantic-studio" })
  });
}

export function rejectCatalogSuggestion(id: string) {
  return apiFetch<CatalogSuggestion>(`/api/catalog-suggestions/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reviewedBy: "semantic-studio" })
  });
}

export function createGoldenCaseFromTest(semanticTestId: string) {
  return apiFetch<GoldenCase>(`/api/golden-cases/from-test/${semanticTestId}`, {
    method: "POST",
    body: JSON.stringify({})
  });
}

export function getGoldenCases() {
  return apiFetch<GoldenCase[]>("/api/golden-cases");
}

export function exportGoldenCases() {
  return apiFetch<unknown[]>("/api/golden-cases/export");
}
