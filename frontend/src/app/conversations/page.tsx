import Link from "next/link";

import { AppLayout } from "@/components/layout/app-layout";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getTelemetryTurns } from "@/lib/api";
import { formatDateTime, formatMs, formatPercent } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { TelemetryTurnsFilters } from "@/types";

const PAGE_SIZE = 20;

const FILTER_CHIPS: Array<{ label: string; query: string }> = [
  { label: "Todas", query: "" },
  { label: "Divergencias", query: "divergence=true" },
  { label: "Dislikes", query: "feedback=dislike" },
  { label: "Likes", query: "feedback=like" },
  { label: "Agricola", query: "domain=agricola" },
  { label: "Materia-prima", query: "domain=materia-prima" }
];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildQuery(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export default async function ConversationsPage({ searchParams }: { searchParams: SearchParams }) {
  try {
    const params = await searchParams;
    const domain = first(params.domain);
    const feedback = first(params.feedback) as TelemetryTurnsFilters["feedback"];
    const divergence = first(params.divergence) === "true" ? true : undefined;
    const page = Math.max(1, Number(first(params.page) ?? "1") || 1);
    const offset = (page - 1) * PAGE_SIZE;

    const { items, total } = await getTelemetryTurns({ limit: PAGE_SIZE, offset, domain, feedback, divergence });
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const activeQuery = buildQuery({ domain, feedback, divergence: divergence ? "true" : undefined }).replace(/^\?/, "");

    return (
      <AppLayout>
        <div className="space-y-6">
          <PageHeader
            eyebrow="Qualidade"
            title="Conversas reais"
            description="Turnos coletados do assistente Helena, com o roteamento real lado a lado com a leitura do motor semantico do Studio."
          />

          <div className="flex flex-wrap gap-2">
            {FILTER_CHIPS.map((chip) => {
              const active = chip.query === activeQuery;
              return (
                <Link
                  key={chip.label}
                  href={`/conversations${chip.query ? `?${chip.query}` : ""}`}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition",
                    active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white/70 text-slate-700 hover:bg-white"
                  )}
                >
                  {chip.label}
                </Link>
              );
            })}
          </div>

          {items.length === 0 ? (
            <EmptyState title="Nenhuma conversa encontrada" description="Ajuste os filtros ou rode uma sincronizacao em POST /api/ingest/sync." />
          ) : (
            <Card className="bg-white/80">
              <CardContent className="overflow-x-auto pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/hora</TableHead>
                      <TableHead>Pergunta</TableHead>
                      <TableHead>Dominio Helena</TableHead>
                      <TableHead>Dominio Studio</TableHead>
                      <TableHead>Confianca Studio</TableHead>
                      <TableHead>Latencia</TableHead>
                      <TableHead>Feedback</TableHead>
                      <TableHead>Divergencia</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((turn) => (
                      <TableRow key={turn.id}>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(turn.sourceCreatedAt)}</TableCell>
                        <TableCell className="max-w-sm font-medium">
                          {turn.question.length > 90 ? `${turn.question.slice(0, 90)}…` : turn.question || "(sem pergunta)"}
                        </TableCell>
                        <TableCell>
                          {turn.domain ? <Badge variant="outline">{turn.domain}</Badge> : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          {turn.studioDomain ? <Badge variant="success">{turn.studioDomain}</Badge> : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>{turn.studioConfidence !== null ? formatPercent(turn.studioConfidence) : "—"}</TableCell>
                        <TableCell className="whitespace-nowrap">{turn.latencyMs !== null ? formatMs(turn.latencyMs) : "—"}</TableCell>
                        <TableCell>
                          {turn.feedbackRating ? (
                            <Badge variant={turn.feedbackRating === "like" ? "success" : "danger"}>{turn.feedbackRating}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={turn.hasDivergence ? "danger" : "outline"}>{turn.hasDivergence ? "Sim" : "Nao"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Link href={`/conversations/${turn.id}`} className="text-sm font-medium text-primary hover:underline">
                            Ver
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {total} conversas · pagina {page} de {totalPages}
                  </span>
                  <div className="flex gap-2">
                    {page > 1 ? (
                      <Link
                        href={`/conversations${buildQuery({ domain, feedback, divergence: divergence ? "true" : undefined, page: String(page - 1) })}`}
                        className="rounded-full border border-border bg-white/70 px-4 py-1.5 font-medium text-slate-700 hover:bg-white"
                      >
                        Anterior
                      </Link>
                    ) : null}
                    {page < totalPages ? (
                      <Link
                        href={`/conversations${buildQuery({ domain, feedback, divergence: divergence ? "true" : undefined, page: String(page + 1) })}`}
                        className="rounded-full border border-border bg-white/70 px-4 py-1.5 font-medium text-slate-700 hover:bg-white"
                      >
                        Proxima
                      </Link>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </AppLayout>
    );
  } catch (error) {
    return (
      <AppLayout>
        <ErrorState message={error instanceof Error ? error.message : "Nao foi possivel carregar as conversas."} />
      </AppLayout>
    );
  }
}
