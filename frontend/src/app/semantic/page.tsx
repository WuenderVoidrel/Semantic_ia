"use client";

import { useState, useTransition } from "react";

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
import { generateSemanticPlan } from "@/lib/api";
import { formatPercent } from "@/lib/formatters";
import type { SemanticPlan } from "@/types";

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 rounded-2xl bg-secondary/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export default function SemanticPage() {
  const [question, setQuestion] = useState("quanto moeu ontem por turno?");
  const [plan, setPlan] = useState<SemanticPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function submitQuestion() {
    try {
      const response = await generateSemanticPlan(question);
      setPlan(response);
    } catch (submitError) {
      setPlan(null);
      setError(submitError instanceof Error ? submitError.message : "Nao foi possivel gerar o plano semantico.");
    }
  }

  function handleSubmit() {
    setError(null);

    startTransition(() => {
      void submitQuestion();
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
              <Button onClick={handleSubmit} disabled={isPending || question.trim().length < 3}>
                Gerar plano semantico
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {isPending ? <LoadingState label="Gerando plano semantico..." /> : null}
            {error ? <ErrorState message={error} /> : null}

            {!isPending && !error && !plan ? (
              <EmptyState
                title="Nenhum plano gerado ainda"
                description="Envie uma pergunta para visualizar intencao, metrica, periodo, agrupamentos e skills sugeridas."
              />
            ) : null}

            {plan ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <ResultRow label="Intencao" value={plan.intent} />
                  <ResultRow label="Dominio" value={plan.domain?.name ?? "Nao identificado"} />
                  <ResultRow label="Metrica" value={plan.metric?.name ?? "Nao identificada"} />
                  <ResultRow label="Periodo" value={plan.period ? `${plan.period.raw} (${plan.period.value})` : "Nao detectado"} />
                  <ResultRow
                    label="Agrupamentos"
                    value={plan.groupBy.length > 0 ? plan.groupBy.map((item) => GROUP_BY_LABELS[item] ?? item).join(", ") : "Nenhum"}
                  />
                  <ResultRow label="Confianca" value={formatPercent(plan.confidence)} />
                </div>

                <Card className="bg-white/80">
                  <CardHeader>
                    <CardTitle>Leitura do plano</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
              </>
            ) : null}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
