import type { MappingConfidence } from "@/lib/types";

const CONFIDENCE_STYLES: Record<MappingConfidence, string> = {
  HIGH: "bg-success/20 text-success",
  MED: "bg-warning/20 text-warning",
  LOW: "bg-error/20 text-error",
};

interface ConfidenceBadgeProps {
  confidence: MappingConfidence;
}

export default function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${CONFIDENCE_STYLES[confidence]}`}
    >
      {confidence}
    </span>
  );
}
