import type { InsightCard } from "@/lib/mock-data";

const KIND_STYLES: Record<
  InsightCard["kind"],
  { border: string; bg: string; dot: string; label: string }
> = {
  finding: {
    border: "border-warning/30",
    bg: "bg-warning/5",
    dot: "bg-warning",
    label: "Finding",
  },
  risk: {
    border: "border-error/30",
    bg: "bg-error/5",
    dot: "bg-error",
    label: "Risk",
  },
  compliant: {
    border: "border-success/30",
    bg: "bg-success/5",
    dot: "bg-success",
    label: "Compliant",
  },
  info: {
    border: "border-accent/20",
    bg: "bg-accent/5",
    dot: "bg-accent",
    label: "Info",
  },
};

export default function InsightCards({ cards }: { cards: InsightCard[] }) {
  if (cards.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-5">
      {cards.map((card, i) => {
        const s = KIND_STYLES[card.kind];
        return (
          <div
            key={i}
            className={`flex items-start gap-2 px-3 py-2 rounded-lg border ${s.border} ${s.bg} max-w-xs`}
          >
            <div className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${s.dot}`} />
            <div className="min-w-0">
              <span className="text-[9px] uppercase tracking-[0.1em] font-medium text-muted block mb-0.5">
                {s.label}
              </span>
              <p className="text-xs text-foreground/85 leading-snug">{card.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
