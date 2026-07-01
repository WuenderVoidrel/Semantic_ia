import { Activity, CircleDollarSign, MessagesSquare, ThumbsUp, Timer, TriangleAlert } from "lucide-react";

import { AppLayout } from "@/components/layout/app-layout";
import { TelemetryCharts } from "@/components/telemetry/telemetry-charts";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTelemetryStats } from "@/lib/api";
import { formatInt, formatMs, formatPercent, formatUsd } from "@/lib/formatters";

export default async function TelemetryPage() {
  try {
    const stats = await getTelemetryStats();

    const kpis = [
      { label: "Turnos", value: formatInt(stats.totals.turns), icon: Activity },
      { label: "Conversas", value: formatInt(stats.totals.conversations), icon: MessagesSquare },
      { label: "Custo total", value: formatUsd(stats.totals.costUsd), icon: CircleDollarSign },
      { label: "Latencia media", value: formatMs(stats.totals.avgLatencyMs), icon: Timer },
      { label: "Taxa de erro", value: formatPercent(stats.totals.errorRate), icon: TriangleAlert },
      { label: "Likes / Dislikes", value: `${formatInt(stats.feedback.like)} / ${formatInt(stats.feedback.dislike)}`, icon: ThumbsUp }
    ];

    return (
      <AppLayout>
        <div className="space-y-6">
          <PageHeader
            eyebrow="Observabilidade"
            title="Telemetria da Helena"
            description="Metricas reais das conversas de BI coletadas do assistente: custo, latencia, volume e feedback."
          />

          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {kpis.map((kpi) => (
              <Card key={kpi.label} className="bg-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm text-muted-foreground">{kpi.label}</CardTitle>
                  <div className="rounded-2xl bg-secondary p-2.5 text-primary">
                    <kpi.icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold text-foreground">{kpi.value}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          <TelemetryCharts stats={stats} />
        </div>
      </AppLayout>
    );
  } catch (error) {
    return (
      <AppLayout>
        <ErrorState message={error instanceof Error ? error.message : "Nao foi possivel carregar a telemetria."} />
      </AppLayout>
    );
  }
}
