import { Badge } from "@/components/ui/badge";
import { formatStatus } from "@/lib/formatters";

type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = status === "active" ? "success" : status === "draft" ? "warning" : "outline";

  return <Badge variant={variant}>{formatStatus(status)}</Badge>;
}
