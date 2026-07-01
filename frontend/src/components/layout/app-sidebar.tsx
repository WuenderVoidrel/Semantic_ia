"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BarChart3, BookOpen, BrainCircuit, ClipboardCheck, FolderKanban, LayoutDashboard, LineChart, Sparkles, Workflow } from "lucide-react";

import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const icons = {
  dashboard: LayoutDashboard,
  telemetry: Activity,
  domains: FolderKanban,
  metrics: BarChart3,
  skills: BrainCircuit,
  semantic: Workflow,
  history: LineChart,
  curation: Sparkles,
  goldenSet: ClipboardCheck
};

type AppSidebarProps = {
  compact?: boolean;
};

export function AppSidebar({ compact = false }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 px-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          <BookOpen className="h-4 w-4" />
          Helena Studio
        </div>
        {!compact ? (
          <div>
            <h2 className="text-xl font-semibold text-foreground">Semantic Studio</h2>
            <p className="mt-1 text-sm text-muted-foreground">Camada semantica administrativa, pronta para evoluir com a Helena.</p>
          </div>
        ) : null}
      </div>

      <nav className="mt-8 space-y-2">
        {NAV_ITEMS.map((item) => {
          const Icon = icons[item.key];
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                active ? "bg-primary text-primary-foreground shadow-soft" : "text-slate-700 hover:bg-white"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
