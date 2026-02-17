import type { FindingSeverity } from "@/lib/types";

const SEVERITY_STYLES: Record<FindingSeverity, string> = {
  CRIT: "bg-error/20 text-error",
  HIGH: "bg-warning/20 text-warning",
  MED: "bg-accent/20 text-accent",
  LOW: "bg-muted/20 text-muted",
  INFO: "bg-info/20 text-info",
};

interface SeverityBadgeProps {
  severity: FindingSeverity;
}

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${SEVERITY_STYLES[severity]}`}
    >
      {severity}
    </span>
  );
}
