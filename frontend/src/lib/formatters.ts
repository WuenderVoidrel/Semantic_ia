import { STATUS_LABELS } from "./constants";

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatStatus(value: string) {
  return STATUS_LABELS[value] ?? value;
}
