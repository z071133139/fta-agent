"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Pursuit, PursuitDeliverable } from "@/lib/mock-data";

const STATUS_DOT: Record<PursuitDeliverable["status"], string> = {
  ready: "bg-success",
  in_progress: "bg-warning",
  not_started: "bg-muted/40",
};

const STATUS_LABEL: Record<PursuitDeliverable["status"], string> = {
  ready: "Ready",
  in_progress: "In Progress",
  not_started: "Not Started",
};

const STATUS_TEXT: Record<PursuitDeliverable["status"], string> = {
  ready: "text-success",
  in_progress: "text-warning",
  not_started: "text-muted",
};

export function PursuitContent({ pursuit }: { pursuit: Pursuit }) {
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-[10px] uppercase tracking-[0.15em] text-muted font-medium">
          Deliverables
        </h2>
        <div className="flex-1 h-px bg-border/30" />
      </div>

      <div className="flex flex-col gap-2">
        {pursuit.deliverables.map((d, i) => (
          <motion.button
            key={d.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            onClick={() => router.push(`/pursue/${pursuit.pursuit_id}/${d.id}`)}
            className="w-full flex items-center gap-3 rounded-lg border border-border/30 bg-surface/60 px-4 py-3 text-left hover:bg-surface-alt/40 transition-colors group"
          >
            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${STATUS_DOT[d.status]}`} />

            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground/90 font-medium">{d.name}</p>
              {d.summary && (
                <p className="text-[10px] text-muted mt-0.5 truncate">{d.summary}</p>
              )}
            </div>

            <span className={`text-[10px] font-medium shrink-0 ${STATUS_TEXT[d.status]}`}>
              {STATUS_LABEL[d.status]}
            </span>

            <span className="text-[10px] font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              Open →
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
