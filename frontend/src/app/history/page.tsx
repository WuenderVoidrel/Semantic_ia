import { AppLayout } from "@/components/layout/app-layout";
import { GoldenCaseButton } from "@/components/semantic/golden-case-button";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSemanticHistory } from "@/lib/api";
import { formatDateTime, formatPercent } from "@/lib/formatters";

export default async function HistoryPage() {
  try {
    const history = await getSemanticHistory();

    return (
      <AppLayout>
        <div className="space-y-6">
          <PageHeader
            eyebrow="Rastreabilidade"
            title="Historico de testes"
            description="Ultimos testes semanticos armazenados pelo backend para acompanhar a evolucao da camada."
          />

          {history.length === 0 ? (
            <EmptyState title="Nenhum teste salvo" description="Assim que o simulador gerar semantic plans, o historico sera exibido aqui." />
          ) : (
            <Card className="bg-white/80">
              <CardContent className="overflow-x-auto pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pergunta</TableHead>
                      <TableHead>Confianca</TableHead>
                      <TableHead>Esclarecimento</TableHead>
                      <TableHead>Divergencia</TableHead>
                      <TableHead>Data/hora</TableHead>
                      <TableHead>Resumo</TableHead>
                      <TableHead>Golden</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="max-w-sm font-medium">{item.input}</TableCell>
                        <TableCell>{formatPercent(item.confidence)}</TableCell>
                        <TableCell>
                          <Badge variant={item.needsClarification ? "warning" : "success"}>
                            {item.needsClarification ? "Sim" : "Nao"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.hasDivergence ? "danger" : "outline"}>
                            {item.hasDivergence ? "Sim" : "Nao"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                        <TableCell className="max-w-md text-muted-foreground">{item.generatedPlan.explanation}</TableCell>
                        <TableCell>
                          <GoldenCaseButton semanticTestId={item.id} />
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
        <ErrorState message={error instanceof Error ? error.message : "Nao foi possivel carregar o historico."} />
      </AppLayout>
    );
  }
}
