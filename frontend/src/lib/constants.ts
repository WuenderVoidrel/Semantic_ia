export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", key: "dashboard" },
  { href: "/telemetry", label: "Telemetria", key: "telemetry" },
  { href: "/domains", label: "Dominios", key: "domains" },
  { href: "/metrics", label: "Metricas", key: "metrics" },
  { href: "/skills", label: "Skills", key: "skills" },
  { href: "/semantic", label: "Simulador Semantico", key: "semantic" },
  { href: "/history", label: "Historico", key: "history" },
  { href: "/curation", label: "Curadoria", key: "curation" },
  { href: "/golden-set", label: "Golden Set", key: "goldenSet" }
] as const;

export const STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  inactive: "Inativo",
  draft: "Rascunho",
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado"
};

export const GROUP_BY_LABELS: Record<string, string> = {
  shift: "Turno",
  day: "Dia",
  month: "Mes",
  farm: "Fazenda",
  front: "Frente",
  equipment: "Equipamento"
};
