"use client";

import Link from "next/link";
import { Menu, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { AppSidebar } from "./app-sidebar";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-4 py-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <AppSidebar compact />
          </SheetContent>
        </Sheet>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Ambiente local</p>
          <h1 className="text-lg font-semibold text-foreground">Helena Semantic Studio</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 md:flex md:items-center md:gap-2">
          <Sparkles className="h-4 w-4" />
          Base pronta para integracao futura
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/">Inicio</Link>
        </Button>
      </div>
    </header>
  );
}
