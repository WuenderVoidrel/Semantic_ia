import type { ReactNode } from "react";

import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_22%),linear-gradient(180deg,_#f8fafc_0%,_#eef5f4_100%)]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 md:px-6 lg:px-8">
        <aside className="hidden w-80 rounded-[2rem] border border-white/50 bg-[#f5efe3]/80 p-6 shadow-soft backdrop-blur md:block">
          <AppSidebar />
        </aside>

        <div className="flex min-h-full flex-1 flex-col gap-6">
          <AppHeader />
          <main className="flex-1 animate-fade-up">{children}</main>
        </div>
      </div>
    </div>
  );
}
