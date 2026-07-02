import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AppLayout } from "@/components/layout/app-layout";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTelemetryTurn } from "@/lib/api";
import { formatDateTime, formatMs, formatPercent, formatUsd } from "@/lib/formatters";
import type { SemanticPlan } from "@/types";

type Params = Promise<{ id: string }>;

function isSemanticPlan(plan: unknown): plan is SemanticPlan {
  return Boolean(plan && typeof plan === "object" && "confidence" in plan);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm text-foreground">{children}</div>
    </div>
  );
}

export default async function ConversationDetailPage({ params }: { params: Params }) {
  try {
    const { id } = await params;
    const turn = await getTelemetryTurn(id);
    const plan = isSemanticPlan(turn.studioPlan) ? turn.studioPlan : null;
    const metricsRequested = Array.isArray(turn.metricsRequested) ? turn.metricsRequested.filter((m): m is string => typeof m === "string") : [];
    const costUsd = turn.costUsd === null ? null : Number(turn.costUsd);

    return (
      <AppLayout>
        <div className="space-y-6">
          <Link href="/conversations" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Voltar para conversas
          </Link>

          <PageHeader
            eyebrow={`Turno · ${formatDateTime(turn.sourceCreatedAt)}`}
            title={turn.question || "(sem pergunta)"}
            description={turn.hasDivergence ? "Este turno tem divergencia entre o roteamento real e a leitura do Studio." : "Detalhe completo do turno coletado do assistente."}
          />

          <section className="grid gap-5 lg:grid-cols-2">
            <Card className="bg-white/80">
              <CardHeader>
                <CardTitle className="text-base">Pergunta e resposta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field label="Pergunta do usuario">
                  <p className="whitespace-pre-wrap">{turn.question || "—"}</p>
                </Field>
                <Field label="Resposta da Helena">
                  <p className="whitespace-pre-wrap text-muted-foreground">{turn.answer || "—"}</p>
                </Field>
                <div className="flex flex-wrap gap-2 pt-2">
                  {turn.feedbackRating ? (
                    <Badge variant={turn.feedbackRating === "like" ? "success" : "danger"}>
                      {turn.feedbackRating}
                      {turn.feedbackReason ? ` · ${turn.feedbackReason}` : ""}
                    </Badge>
                  ) : (
                    <Badge variant="outline">sem feedback</Badge>
                  )}
                  {turn.errorCode ? <Badge variant="danger">{turn.errorCode}</Badge> : null}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80">
              <CardHeader>
                <CardTitle className="text-base">Operacional</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Field label="Modelo">{turn.model ?? "—"}</Field>
                <Field label="Tool">{turn.toolUsed ?? "—"}</Field>
                <Field label="Latencia">{turn.latencyMs !== null ? formatMs(turn.latencyMs) : "—"}</Field>
                <Field label="Custo">{costUsd !== null ? formatUsd(costUsd) : "—"}</Field>
                <Field label="Tokens (prompt/completion)">
                  {turn.promptTokens ?? "—"} / {turn.completionTokens ?? "—"}
                </Field>
                <Field label="Status">{turn.status ?? "—"}</Field>
                <Field label="Sessao">
                  <span className="break-all text-xs text-muted-foreground">{turn.sourceSessionId}</span>
                </Field>
                <Field label="Verificador">
                  {turn.verifierOk === null ? "—" : turn.verifierOk ? "ok" : "reprovou"}
                </Field>
              </CardContent>
            </Card>

            <Card className="bg-white/80">
              <CardHeader>
                <CardTitle className="text-base">Roteamento real (Helena)</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Field label="Dominio">
                  {turn.domain ? <Badge variant="outline">{turn.domain}</Badge> : "—"}
                </Field>
                <Field label="Motivo do roteamento">{turn.routingReason ?? "—"}</Field>
                <Field label="Metricas solicitadas">{metricsRequested.length > 0 ? metricsRequested.join(", ") : "—"}</Field>
                <Field label="Periodo">
                  {turn.periodStart ? `${turn.periodStart.slice(0, 10)} a ${turn.periodEnd?.slice(0, 10) ?? "?"}` : "—"}
                </Field>
              </CardContent>
            </Card>

            <Card className={turn.hasDivergence ? "border-red-200 bg-red-50/60" : "bg-white/80"}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Leitura do Studio</CardTitle>
                <Badge variant={turn.hasDivergence ? "danger" : "outline"}>
                  {turn.hasDivergence ? "Divergencia" : "Sem divergencia"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Dominio Studio">
                    {turn.studioDomain ? <Badge variant="success">{turn.studioDomain}</Badge> : "nao identificado"}
                  </Field>
                  <Field label="Metrica Studio">{turn.studioMetricKey ?? "—"}</Field>
                  <Field label="Confianca">{turn.studioConfidence !== null ? formatPercent(turn.studioConfidence) : "—"}</Field>
                  <Field label="Precisa esclarecer?">{plan ? (plan.needsClarification ? "Sim" : "Nao") : "—"}</Field>
                </div>
                {plan ? (
                  <Field label="Explicacao do plano">
                    <p className="text-muted-foreground">{plan.explanation}</p>
                  </Field>
                ) : null}
                {turn.studioPlan ? (
                  <details className="rounded-xl border border-border bg-white/70 p-3">
                    <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plano completo (JSON)</summary>
                    <pre className="mt-2 max-h-72 overflow-auto text-xs text-slate-700">{JSON.stringify(turn.studioPlan, null, 2)}</pre>
                  </details>
                ) : null}
              </CardContent>
            </Card>
          </section>
        </div>
      </AppLayout>
    );
  } catch (error) {
    return (
      <AppLayout>
        <ErrorState message={error instanceof Error ? error.message : "Nao foi possivel carregar o turno."} />
      </AppLayout>
    );
  }
}
