import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p> : null}
        <h2 className="text-2xl font-semibold text-foreground md:text-3xl">{title}</h2>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">{description}</p>
      </div>
      {actions ? <div>{actions}</div> : null}
    </div>
  );
}
