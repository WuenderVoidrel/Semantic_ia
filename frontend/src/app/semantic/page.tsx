"use client";

import { useEffect, useState, useTransition } from "react";

import { AppLayout } from "@/components/layout/app-layout";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { GROUP_BY_LABELS } from "@/lib/constants";
import { analyzeSemanticInput, generateSemanticPlan, relaySemanticPlan } from "@/lib/api";
import { formatPercent } from "@/lib/formatters";
import type { SemanticAnalysis, SemanticPlan, SemanticRelayResult } from "@/types";

function ResultRow({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="space-y-1 rounded-2xl bg-secondary/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className={muted ? "text-sm font-medium text-muted-foreground" : "text-sm font-medium text-foreground"}>{value}</p>
    </div>
  );
}

function PlanSummary({ plan }: { plan: SemanticPlan }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ResultRow label="Intencao" value={plan.intent} />
      <ResultRow label="Dominio" value={plan.domain?.name ?? "Nao identificado"} muted={!plan.domain} />
      <ResultRow label="Metrica" value={plan.metric?.name ?? "Nao identificada"} muted={!plan.metric} />
      <ResultRow label="Periodo" value={plan.period ? `${plan.period.raw} (${plan.period.value})` : "Nao detectado"} muted={!plan.period} />
      <ResultRow
        label="Agrupamentos"
        value={plan.groupBy.length > 0 ? plan.groupBy.map((item) => GROUP_BY_LABELS[item] ?? item).join(", ") : "Nenhum"}
        muted={plan.groupBy.length === 0}
      />
      <ResultRow label="Confianca" value={formatPercent(plan.confidence)} muted={plan.confidence < 0.5} />
    </div>
  );
}

function LiveInspector({ analysis }: { analysis: SemanticAnalysis }) {
  const { plan, diagnostics } = analysis;

  return (
    <Card className="bg-white/80">
      <CardHeader>
        <CardTitle>Leitura em tempo real</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PlanSummary plan={plan} />
        <div className="flex flex-wrap gap-2">
          <Badge variant={plan.needsClarification ? "warning" : "success"}>
            {plan.needsClarification ? "Baixa confianca" : "Entendimento consistente"}
          </Badge>
          {diagnostics.unmatchedTokens.map((token) => (
            <Badge key={token} variant="danger">
              termo sem match: {token}
            </Badge>
          ))}
          {plan.skillsSuggested.map((skill) => (
            <Badge key={skill} variant="outline">
              {skill}
            </Badge>
          ))}
        </div>
        {diagnostics.lowConfidenceReasons.length > 0 ? (
          <div className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {diagnostics.lowConfidenceReasons.map((reason) => (
              <p key={reason}>{reason}</p>
            ))}
          </div>
        ) : null}
        <div className="grid gap-3 md:grid-cols-5">
          {Object.entries(diagnostics.confidenceBreakdown).map(([key, value]) => (
            <ResultRow key={key} label={key} value={formatPercent(value)} muted={value === 0} />
          ))}
        </div>
        {diagnostics.candidateMetrics.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Candidatas</p>
            <div className="flex flex-wrap gap-2">
              {diagnostics.candidateMetrics.map((candidate) => (
                <Badge key={candidate.id} variant="outline">
                  {candidate.name} · {formatPercent(candidate.score)}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function SemanticPage() {
  const [question, setQuestion] = useState("quanto moeu ontem por turno?");
  const [analysis, setAnalysis] = useState<SemanticAnalysis | null>(null);
  const [plan, setPlan] = useState<SemanticPlan | null>(null);
  const [relayResult, setRelayResult] = useState<SemanticRelayResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [relayError, setRelayError] = useState<string | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const trimmed = question.trim();

    if (trimmed.length < 3) {
      setAnalysis(null);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setIsAnalyzing(true);
      analyzeSemanticInput(trimmed)
        .then((response) => {
          if (!controller.signal.aborted) {
            setAnalysis(response);
            setLiveError(null);
          }
        })
        .catch((submitError) => {
          if (!controller.signal.aborted) {
            setLiveError(submitError instanceof Error ? submitError.message : "Nao foi possivel analisar a pergunta.");
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsAnalyzing(false);
          }
        });
    }, 450);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [question]);

  async function submitQuestion() {
    try {
      const response = await generateSemanticPlan(question);
      setPlan(response);
      setRelayResult(null);
    } catch (submitError) {
      setPlan(null);
      setError(submitError instanceof Error ? submitError.message : "Nao foi possivel gerar o plano semantico.");
    }
  }

  async function sendToHelena() {
    try {
      const response = await relaySemanticPlan(question);
      setPlan(response.plan);
      setRelayResult(response);
    } catch (submitError) {
      setRelayResult(null);
      setRelayError(submitError instanceof Error ? submitError.message : "Nao foi possivel encaminhar para a Helena.");
    }
  }

  function handleSubmit() {
    setError(null);
    setRelayError(null);

    startTransition(() => {
      void submitQuestion();
    });
  }

  function handleRelay() {
    setError(null);
    setRelayError(null);

    startTransition(() => {
      void sendToHelena();
    });
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Simulador"
          title="Gerador de semantic plan"
          description="Teste perguntas em linguagem natural sem LLM, usando regras deterministicas e o catalogo de metricas cadastrado."
        />

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card className="bg-white/80">
            <CardHeader>
              <CardTitle>Entrada da pergunta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="quanto moeu ontem por turno?"
              />
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={handleSubmit} disabled={isPending || question.trim().length < 3}>
                  Salvar plano
                </Button>
                <Button variant="outline" onClick={handleRelay} disabled={isPending || question.trim().length < 3}>
                  Enviar para Helena
                </Button>
              </div>
              {isAnalyzing ? <p className="text-sm text-muted-foreground">Analisando camada semantica...</p> : null}
              {liveError ? <ErrorState message={liveError} /> : null}
            </CardContent>
          </Card>

          <div className="space-y-6">
            {analysis ? <LiveInspector analysis={analysis} /> : null}
            {isPending ? <LoadingState label="Gerando plano semantico..." /> : null}
            {error ? <ErrorState message={error} /> : null}
            {relayError ? <ErrorState message={relayError} /> : null}

            {!isPending && !error && !analysis && !plan ? (
              <EmptyState
                title="Nenhuma leitura ainda"
                description="Digite uma pergunta para visualizar o entendimento semantico em tempo real."
              />
            ) : null}

            {plan ? (
              <>
                <Card className="bg-white/80">
                  <CardHeader>
                    <CardTitle>Ultimo plano salvo/enviado</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <PlanSummary plan={plan} />
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={plan.needsClarification ? "warning" : "success"}>
                        {plan.needsClarification ? "Necessita esclarecimento" : "Plano consistente"}
                      </Badge>
                      {plan.skillsSuggested.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm leading-7 text-muted-foreground">{plan.explanation}</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/80">
                  <CardHeader>
                    <CardTitle>JSON do semantic plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm text-slate-100">
                      {JSON.stringify(plan, null, 2)}
                    </pre>
                  </CardContent>
                </Card>

                {relayResult ? (
                  <Card className="bg-white/80">
                    <CardHeader>
                      <CardTitle>Trace de integracao com Helena</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={relayResult.relay.forwarded ? "success" : "warning"}>
                          {relayResult.relay.forwarded ? "Encaminhado" : "Nao encaminhado"}
                        </Badge>
                        <Badge variant={relayResult.relay.ok ? "success" : "warning"}>
                          {relayResult.relay.ok ? "Resposta recebida" : "Resposta nao-sucedida"}
                        </Badge>
                        <Badge variant="outline">
                          {relayResult.relay.targetUrl ?? "Helena sem URL configurada"}
                        </Badge>
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <ResultRow label="Status" value={relayResult.relay.status?.toString() ?? "Nao informado"} />
                        <ResultRow label="Metrica enviada" value={relayResult.plan.metric?.name ?? "Nao identificada"} />
                        <ResultRow label="Dominio enviado" value={relayResult.plan.domain?.name ?? "Nao identificado"} />
                      </div>
                      <p className="text-sm leading-7 text-muted-foreground">
                        {relayResult.relay.error ?? "A Helena/router respondeu com o semantic plan encaminhado com sucesso."}
                      </p>
                      {relayResult.relay.response ? (
                        <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm text-slate-100">
                          {JSON.stringify(relayResult.relay.response, null, 2)}
                        </pre>
                      ) : null}
                    </CardContent>
                  </Card>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
