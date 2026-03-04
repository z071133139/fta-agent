"use client";

import type { ClassificationTier, ClassificationStatus } from "@/lib/mock-hierarchy-data";

const TIER_CONFIG: Record<
  ClassificationTier,
  { label: string; icon: string; bg: string; text: string; border: string }
> = {
  tier1: {
    label: "T1 Rule",
    icon: "\u25A0", // filled square
    bg: "bg-success/15",
    text: "text-success",
    border: "border-success/30",
  },
  tier2: {
    label: "T2 Pattern",
    icon: "\u25CF", // filled circle
    bg: "bg-accent/15",
    text: "text-accent",
    border: "border-accent/30",
  },
  tier3: {
    label: "T3 Agent",
    icon: "\u25C6", // filled diamond
    bg: "bg-warning/15",
    text: "text-warning",
    border: "border-warning/30",
  },
};

const STATUS_OVERRIDE: Partial<
  Record<ClassificationStatus, { bg: string; text: string; border: string; suffix: string }>
> = {
  approved: {
    bg: "bg-success/15",
    text: "text-success",
    border: "border-success/30",
    suffix: "Pinned",
  },
  rejected: {
    bg: "bg-error/15",
    text: "text-error",
    border: "border-error/30",
    suffix: "Rejected",
  },
  manual_override: {
    bg: "bg-foreground/10",
    text: "text-foreground",
    border: "border-foreground/20",
    suffix: "Override",
  },
};

interface TierBadgeProps {
  tier: ClassificationTier;
  status?: ClassificationStatus;
  compact?: boolean;
}

export function TierBadge({ tier, status, compact }: TierBadgeProps) {
  const config = TIER_CONFIG[tier];
  const override = status ? STATUS_OVERRIDE[status] : undefined;

  const bg = override?.bg ?? config.bg;
  const text = override?.text ?? config.text;
  const border = override?.border ?? config.border;
  const label = override?.suffix
    ? `${config.icon} ${override.suffix}`
    : `${config.icon} ${config.label}`;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center justify-center w-5 h-5 rounded text-[11px] ${bg} ${text} ${border} border`}
        title={config.label}
      >
        {config.icon}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider ${bg} ${text} ${border} border`}
    >
      {label}
    </span>
  );
}
