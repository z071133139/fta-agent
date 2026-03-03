"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDataStore, FILE_TYPE_LABELS, type DataFile } from "@/lib/data-store";
import { WORKSTREAM_DATA_REQUIREMENTS } from "@/lib/workstream-data-config";

export function DataStatusWidget({ engagementId }: { engagementId: string }) {
  const router = useRouter();
  const filesMap = useDataStore((s) => s.files);
  const files = useMemo(
    () => filesMap[engagementId] ?? [],
    [filesMap, engagementId]
  );

  // Find workstreams that have data requirements
  const wsEntries = useMemo(() => {
    return Object.entries(WORKSTREAM_DATA_REQUIREMENTS).map(([wsId, config]) => {
      const uploadedTypes = new Set(files.map((f: DataFile) => f.type));
      const total = config.requirements.length;
      const uploaded = config.requirements.filter((r) =>
        uploadedTypes.has(r.type)
      ).length;
      return {
        wsId,
        name: config.workstream_name,
        requirements: config.requirements,
        total,
        uploaded,
        uploadedTypes,
      };
    });
  }, [files]);

  if (wsEntries.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-[10px] uppercase tracking-[0.15em] text-muted font-medium">
          Data
        </h2>
        <div className="flex-1 h-px bg-border/30" />
      </div>

      <div className="flex flex-col gap-2">
        {wsEntries.map((ws) => (
          <div
            key={ws.wsId}
            className="rounded-lg border border-border/30 bg-surface/60 px-4 py-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-foreground/90 font-medium">
                {ws.name}
              </span>
              <span className="text-[10px] font-mono text-muted/50">
                {ws.wsId}
              </span>
            </div>

            {/* Type pips */}
            <div className="flex items-center gap-2 mb-2">
              {ws.requirements.map((req) => {
                const have = ws.uploadedTypes.has(req.type);
                return (
                  <div key={req.type} className="flex items-center gap-1">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        have ? "bg-success" : "bg-muted/40"
                      }`}
                    />
                    <span
                      className={`text-[10px] font-mono ${
                        have ? "text-success" : "text-muted"
                      }`}
                    >
                      {FILE_TYPE_LABELS[req.type]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted">
                {ws.uploaded}/{ws.total} uploaded
              </span>
              <button
                onClick={() =>
                  router.push(`/${engagementId}/workstreams/${ws.wsId}`)
                }
                className="text-[10px] font-medium text-accent hover:opacity-70 transition-opacity"
              >
                {ws.uploaded < ws.total ? "Setup →" : "View →"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
