"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDataStore, type DataFile } from "@/lib/data-store";
import { WORKSTREAM_DATA_REQUIREMENTS } from "@/lib/workstream-data-config";

export function WorkstreamDataSummary({
  engagementId,
}: {
  engagementId: string;
}) {
  const router = useRouter();
  const filesMap = useDataStore((s) => s.files);
  const files = useMemo(
    () => filesMap[engagementId] ?? [],
    [filesMap, engagementId]
  );
  const uploadedTypes = useMemo(
    () => new Set(files.map((f: DataFile) => f.type)),
    [files]
  );

  const entries = Object.values(WORKSTREAM_DATA_REQUIREMENTS);
  if (entries.length === 0) return null;

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-[10px] uppercase tracking-[0.15em] text-muted font-medium">
          Data Sources
        </h3>
        <div className="flex-1 h-px bg-border/30" />
      </div>

      <div className="flex flex-col gap-2">
        {entries.map((ws) => {
          const uploaded = ws.requirements.filter((r) =>
            uploadedTypes.has(r.type)
          ).length;
          const total = ws.requirements.length;
          const allReady = uploaded === total;

          return (
            <button
              key={ws.workstream_id}
              onClick={() =>
                router.push(
                  `/${engagementId}/workstreams/${ws.workstream_id}`
                )
              }
              className="flex items-center gap-3 rounded-lg border border-border/40 bg-surface/60 px-4 py-3 text-left hover:bg-surface-alt/40 transition-colors group"
            >
              {/* Status pip */}
              <span
                className={`h-2 w-2 rounded-full shrink-0 ${
                  allReady
                    ? "bg-success"
                    : uploaded > 0
                      ? "bg-warning"
                      : "bg-muted/40"
                }`}
              />

              {/* Name + count */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground/90 truncate">
                  {ws.workstream_name}
                </p>
                <p className="text-[10px] font-mono text-muted">
                  {uploaded}/{total} data source{total !== 1 ? "s" : ""} uploaded
                </p>
              </div>

              {/* Navigate arrow */}
              <span className="text-muted/40 group-hover:text-foreground/60 transition-colors text-xs">
                &rarr;
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
