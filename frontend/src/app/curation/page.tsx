import { AppLayout } from "@/components/layout/app-layout";
import { CatalogSuggestionTable } from "@/components/semantic/catalog-suggestion-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getCatalogSuggestions } from "@/lib/api";

export default async function CurationPage() {
  try {
    const suggestions = await getCatalogSuggestions("all");

    return (
      <AppLayout>
        <div className="space-y-6">
          <PageHeader
            eyebrow="Curadoria"
            title="Sugestoes de catalogo"
            description="Aliases encontrados a partir de perguntas reais. A aprovacao e sempre manual."
          />

          {suggestions.length === 0 ? (
            <EmptyState title="Nenhuma sugestao ainda" description="Gere planos com baixa confianca ou termos novos para alimentar a fila de curadoria." />
          ) : (
            <Card className="bg-white/80">
              <CardContent className="overflow-x-auto pt-6">
                <CatalogSuggestionTable initialSuggestions={suggestions} />
              </CardContent>
            </Card>
          )}
        </div>
      </AppLayout>
    );
  } catch (error) {
    return (
      <AppLayout>
        <ErrorState message={error instanceof Error ? error.message : "Nao foi possivel carregar a curadoria."} />
      </AppLayout>
    );
  }
}
