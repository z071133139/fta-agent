import type { FindingStatus } from "@/lib/types";

const STATUS_STYLES: Record<FindingStatus, string> = {
  open: "bg-accent/20 text-accent",
  flagged: "bg-warning/20 text-warning",
  in_progress: "bg-info/20 text-info",
  resolved: "bg-success/20 text-success",
};

const STATUS_LABELS: Record<FindingStatus, string> = {
  open: "Open",
  flagged: "Flagged",
  in_progress: "In Progress",
  resolved: "Resolved",
};

interface StatusBadgeProps {
  status: FindingStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
