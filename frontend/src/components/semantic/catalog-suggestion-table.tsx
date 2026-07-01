"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { approveCatalogSuggestion, rejectCatalogSuggestion } from "@/lib/api";
import { formatDateTime, formatPercent } from "@/lib/formatters";
import type { CatalogSuggestion } from "@/types";

export function CatalogSuggestionTable({ initialSuggestions }: { initialSuggestions: CatalogSuggestion[] }) {
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [isPending, startTransition] = useTransition();

  function updateStatus(id: string, status: string) {
    setSuggestions((items) => items.map((item) => item.id === id ? { ...item, status } : item));
  }

  function approve(id: string) {
    startTransition(async () => {
      await approveCatalogSuggestion(id);
      updateStatus(id, "approved");
    });
  }

  function reject(id: string) {
    startTransition(async () => {
      await rejectCatalogSuggestion(id);
      updateStatus(id, "rejected");
    });
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Alias sugerido</TableHead>
          <TableHead>Metrica</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Confianca</TableHead>
          <TableHead>Origem</TableHead>
          <TableHead>Acoes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {suggestions.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.suggestedAlias}</TableCell>
            <TableCell>{item.metric?.name ?? "Nao associada"}</TableCell>
            <TableCell>
              <Badge variant={item.status === "approved" ? "success" : item.status === "rejected" ? "danger" : "warning"}>
                {item.status}
              </Badge>
            </TableCell>
            <TableCell>{typeof item.confidence === "number" ? formatPercent(item.confidence) : "-"}</TableCell>
            <TableCell>{formatDateTime(item.createdAt)}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => approve(item.id)} disabled={isPending || item.status !== "pending"}>
                  <Check className="h-4 w-4" />
                  Aprovar
                </Button>
                <Button size="sm" variant="outline" onClick={() => reject(item.id)} disabled={isPending || item.status !== "pending"}>
                  <X className="h-4 w-4" />
                  Rejeitar
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
