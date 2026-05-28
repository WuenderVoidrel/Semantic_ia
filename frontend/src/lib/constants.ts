export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", key: "dashboard" },
  { href: "/domains", label: "Dominios", key: "domains" },
  { href: "/metrics", label: "Metricas", key: "metrics" },
  { href: "/skills", label: "Skills", key: "skills" },
  { href: "/semantic", label: "Simulador Semantico", key: "semantic" },
  { href: "/history", label: "Historico", key: "history" }
] as const;

export const STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  inactive: "Inativo",
  draft: "Rascunho"
};

export const GROUP_BY_LABELS: Record<string, string> = {
  shift: "Turno",
  day: "Dia",
  month: "Mes",
  farm: "Fazenda",
  front: "Frente",
  equipment: "Equipamento"
};
