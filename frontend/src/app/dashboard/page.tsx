import { BrainCircuit, Database, LineChart, Shapes } from "lucide-react";

import { AppLayout } from "@/components/layout/app-layout";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/lib/api";

const cards = [
  { key: "domains", label: "Dominios", icon: Shapes },
  { key: "metrics", label: "Metricas", icon: Database },
  { key: "skills", label: "Skills", icon: BrainCircuit },
  { key: "semanticTests", label: "Testes semanticos", icon: LineChart }
] as const;

export default async function DashboardPage() {
  try {
    const stats = await getDashboardStats();

    return (
      <AppLayout>
        <div className="space-y-6">
          <PageHeader
            eyebrow="Visao geral"
            title="Dashboard tecnico"
            description="Acompanhe o volume de dominios, metricas, skills e testes semanticos gerados nesta base."
          />

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <Card key={card.key} className="bg-white/80">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">{card.label}</CardTitle>
                  <div className="rounded-2xl bg-secondary p-3 text-primary">
                    <card.icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-semibold text-foreground">{stats[card.key]}</p>
                </CardContent>
              </Card>
            ))}
          </section>
        </div>
      </AppLayout>
    );
  } catch (error) {
    return (
      <AppLayout>
        <ErrorState message={error instanceof Error ? error.message : "Nao foi possivel carregar o dashboard."} />
      </AppLayout>
    );
  }
}
