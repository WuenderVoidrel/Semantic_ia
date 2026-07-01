import { AppLayout } from "@/components/layout/app-layout";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exportGoldenCases, getGoldenCases } from "@/lib/api";
import { formatDateTime } from "@/lib/formatters";

export default async function GoldenSetPage() {
  try {
    const [cases, exported] = await Promise.all([getGoldenCases(), exportGoldenCases()]);

    return (
      <AppLayout>
        <div className="space-y-6">
          <PageHeader
            eyebrow="Regressao"
            title="Golden set semantico"
            description="Casos esperados para validar metrica, periodo, agrupamento e esclarecimento sem congelar valores volateis do BI."
          />

          {cases.length === 0 ? (
            <EmptyState title="Nenhum caso marcado" description="Marque testes no historico para montar a primeira semente de regressao." />
          ) : (
            <>
              <Card className="bg-white/80">
                <CardContent className="overflow-x-auto pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pergunta</TableHead>
                        <TableHead>Metrica esperada</TableHead>
                        <TableHead>Dominio</TableHead>
                        <TableHead>Periodo</TableHead>
                        <TableHead>Agrupamento</TableHead>
                        <TableHead>Criado em</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cases.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="max-w-sm font-medium">{item.input}</TableCell>
                          <TableCell>{item.expectedMetricKey ?? "-"}</TableCell>
                          <TableCell>{item.expectedDomainSlug ?? "-"}</TableCell>
                          <TableCell>{item.expectedPeriodValue ?? "-"}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {(Array.isArray(item.expectedGroupBy) ? item.expectedGroupBy : []).map((group) => (
                                <Badge key={group} variant="outline">{group}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="bg-white/80">
                <CardHeader>
                  <CardTitle>Export JSON</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm text-slate-100">
                    {JSON.stringify(exported, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </AppLayout>
    );
  } catch (error) {
    return (
      <AppLayout>
        <ErrorState message={error instanceof Error ? error.message : "Nao foi possivel carregar o golden set."} />
      </AppLayout>
    );
  }
}
