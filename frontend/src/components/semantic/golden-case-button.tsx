"use client";

import { useState } from "react";
import { ClipboardCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createGoldenCaseFromTest } from "@/lib/api";

export function GoldenCaseButton({ semanticTestId }: { semanticTestId: string }) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleClick() {
    try {
      setStatus("saving");
      await createGoldenCaseFromTest(semanticTestId);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" onClick={handleClick} disabled={status === "saving" || status === "saved"}>
        <ClipboardCheck className="h-4 w-4" />
        {status === "saved" ? "Golden" : "Marcar"}
      </Button>
      {status === "error" ? <span className="text-xs text-rose-600">Falhou</span> : null}
    </div>
  );
}
