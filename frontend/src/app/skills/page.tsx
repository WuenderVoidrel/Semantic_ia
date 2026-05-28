import { AppLayout } from "@/components/layout/app-layout";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSkills } from "@/lib/api";

export default async function SkillsPage() {
  try {
    const skills = await getSkills();

    return (
      <AppLayout>
        <div className="space-y-6">
          <PageHeader
            eyebrow="Skills"
            title="Skills sugeridas"
            description="Camadas auxiliares que o semantic plan pode ativar conforme o contexto da pergunta."
          />

          {skills.length === 0 ? (
            <EmptyState title="Nenhuma skill cadastrada" description="As skills do seed aparecerao aqui assim que o backend estiver populado." />
          ) : (
            <Card className="bg-white/80">
              <CardContent className="overflow-x-auto pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descricao</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {skills.map((skill) => (
                      <TableRow key={skill.id}>
                        <TableCell className="font-medium">{skill.name}</TableCell>
                        <TableCell>{skill.type}</TableCell>
                        <TableCell>{skill.description ?? "Sem descricao"}</TableCell>
                        <TableCell>
                          <StatusBadge status={skill.status} />
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
        <ErrorState message={error instanceof Error ? error.message : "Nao foi possivel carregar as skills."} />
      </AppLayout>
    );
  }
}
