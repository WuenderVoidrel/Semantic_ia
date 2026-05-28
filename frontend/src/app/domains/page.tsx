import { AppLayout } from "@/components/layout/app-layout";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDomains } from "@/lib/api";

export default async function DomainsPage() {
  try {
    const domains = await getDomains();

    return (
      <AppLayout>
        <div className="space-y-6">
          <PageHeader
            eyebrow="Catalogo"
            title="Dominios semanticos"
            description="Lista base de dominios que organizam o entendimento semantico da plataforma."
          />

          {domains.length === 0 ? (
            <EmptyState title="Nenhum dominio cadastrado" description="Quando o seed ou cadastros forem executados, os dominios aparecerao aqui." />
          ) : (
            <Card className="bg-white/80">
              <CardContent className="overflow-x-auto pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Descricao</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {domains.map((domain) => (
                      <TableRow key={domain.id}>
                        <TableCell className="font-medium">{domain.name}</TableCell>
                        <TableCell>{domain.slug}</TableCell>
                        <TableCell>{domain.description ?? "Sem descricao"}</TableCell>
                        <TableCell>
                          <StatusBadge status={domain.status} />
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
        <ErrorState message={error instanceof Error ? error.message : "Nao foi possivel carregar os dominios."} />
      </AppLayout>
    );
  }
}
