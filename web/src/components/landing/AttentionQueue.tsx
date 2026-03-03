"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Engagement, Deliverable, ConsultantPresence } from "@/lib/mock-data";

interface AttentionItem extends Deliverable {
  workstream_name: string;
  presence?: ConsultantPresence;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function getAttentionItems(engagement: Engagement): AttentionItem[] {
  const workplan = engagement.workplan;
  if (!workplan) return [];

  const presenceMap = new Map<string, ConsultantPresence>();
  for (const p of engagement.presence ?? []) {
    if (p.deliverable_id) presenceMap.set(p.deliverable_id, p);
  }

  const items: AttentionItem[] = workplan.workstreams.flatMap((ws) =>
    ws.deliverables
      .filter((d) => d.status === "blocked" || d.needs_input)
      .map((d) => ({
        ...d,
        workstream_name: ws.name,
        presence: presenceMap.get(d.deliverable_id),
      }))
  );

  // blocked first
  items.sort((a, b) => {
    if (a.status === "blocked" && b.status !== "blocked") return -1;
    if (b.status === "blocked" && a.status !== "blocked") return 1;
    return 0;
  });

  return items;
}

const CONSULTANT_INITIALS: Record<string, string> = {
  "mock-001": "SK",
  "mock-002": "TR",
  "mock-003": "PM",
};

export function AttentionQueue({ engagement }: { engagement: Engagement }) {
  const router = useRouter();
  const items = getAttentionItems(engagement);
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) {
    return null;
  }

  // Collapsed: show a compact summary bar
  return (
    <div className="rounded-xl border border-warning/20 bg-warning/[0.03] overflow-hidden">
      {/* Header — always visible, clickable to expand */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-warning/[0.04] transition-colors"
      >
        <div className="h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
        <span className="text-[10px] uppercase tracking-[0.12em] font-medium text-warning">
          Needs Your Attention
        </span>
        <span className="text-[10px] font-mono text-warning/60">{items.length}</span>

        {/* Collapsed summary: inline item names */}
        {!expanded && (
          <span className="flex-1 text-[10px] text-muted truncate ml-1">
            {items.map((it) => it.name).join(" · ")}
          </span>
        )}
        {expanded && <div className="flex-1" />}

        <svg
          className={`h-3 w-3 text-muted/60 transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Expandable items list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-warning/15">
              {items.map((item) => (
                <button
                  key={item.deliverable_id}
                  onClick={() =>
                    router.push(
                      `/${engagement.engagement_id}/deliverables/${item.deliverable_id}`
                    )
                  }
                  className="w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-warning/[0.04] transition-colors group border-b border-warning/10 last:border-b-0"
                >
                  {/* Status dot */}
                  <div
                    className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${
                      item.status === "blocked" ? "bg-error" : "bg-warning"
                    }`}
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground/90 leading-snug">{item.name}</p>
                    {item.agent_summary && (
                      <p className="text-[10px] text-muted mt-0.5 leading-snug truncate">
                        {item.agent_summary}
                      </p>
                    )}
                    <p className="text-[10px] text-muted/50 mt-0.5">{item.workstream_name}</p>
                  </div>

                  {/* Right: presence + CTA */}
                  <div className="shrink-0 flex items-center gap-2">
                    {item.presence && (
                      <div className="flex items-center gap-1">
                        <div
                          className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-medium ${
                            item.presence.is_active
                              ? "bg-success/20 text-success ring-1 ring-success/30"
                              : "bg-surface-alt text-muted"
                          }`}
                        >
                          {CONSULTANT_INITIALS[item.presence.consultant_id] ?? "?"}
                        </div>
                        <span className="text-[10px] text-muted/50 font-mono">
                          {relativeTime(item.presence.last_seen)}
                        </span>
                      </div>
                    )}
                    <span
                      className={`text-[10px] font-medium whitespace-nowrap opacity-60 group-hover:opacity-100 transition-opacity ${
                        item.status === "blocked" ? "text-error" : "text-warning"
                      }`}
                    >
                      {item.status === "blocked" ? "Resolve" : "Review"} →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
