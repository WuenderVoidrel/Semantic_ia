import { AppLayout } from "@/components/layout/app-layout";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getMetrics } from "@/lib/api";

export default async function MetricsPage() {
  try {
    const metrics = await getMetrics();

    return (
      <AppLayout>
        <div className="space-y-6">
          <PageHeader
            eyebrow="Metricas"
            title="Catalogo de metricas"
            description="Cada metrica ja fica associada ao dominio para apoiar a geracao do semantic plan."
          />

          {metrics.length === 0 ? (
            <EmptyState title="Nenhuma metrica encontrada" description="Execute o seed ou crie novas metricas para popular esta tela." />
          ) : (
            <Card className="bg-white/80">
              <CardContent className="overflow-x-auto pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Dominio</TableHead>
                      <TableHead>Chave tecnica</TableHead>
                      <TableHead>Medida DAX</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.map((metric) => (
                      <TableRow key={metric.id}>
                        <TableCell className="font-medium">{metric.name}</TableCell>
                        <TableCell>{metric.domain.name}</TableCell>
                        <TableCell>{metric.technicalKey}</TableCell>
                        <TableCell>{metric.daxMeasure}</TableCell>
                        <TableCell>{metric.unit ?? "-"}</TableCell>
                        <TableCell>
                          <StatusBadge status={metric.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </AppLayout>
    );
  } catch (error) {
    return (
      <AppLayout>
        <ErrorState message={error instanceof Error ? error.message : "Nao foi possivel carregar as metricas."} />
      </AppLayout>
    );
  }
}
