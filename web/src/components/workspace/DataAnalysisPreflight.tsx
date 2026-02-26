"use client";

import { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDataStore, type DataFile, FILE_TYPE_LABELS } from "@/lib/data-store";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function DataSourceBadge({ file }: { file: DataFile }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border/30 bg-surface/40 px-3 py-2">
      <svg
        className="h-4 w-4 text-success shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div className="min-w-0">
        <p className="text-xs text-foreground/90 font-medium truncate">{file.name}</p>
        <p className="text-[10px] font-mono text-muted">
          {file.row_count.toLocaleString()} rows · {formatBytes(file.size_bytes)} · {FILE_TYPE_LABELS[file.type]} · {relativeTime(file.uploaded_at)}
        </p>
      </div>
    </div>
  );
}

interface DataAnalysisPreflightProps {
  deliverableName: string;
  agentName: string;
  bullets: string[];
  onStart: () => void;
}

export function DataAnalysisPreflight({
  deliverableName,
  agentName,
  bullets,
  onStart,
}: DataAnalysisPreflightProps) {
  const params = useParams<{ engagementId: string }>();
  const router = useRouter();
  const filesMap = useDataStore((s) => s.files);
  const files = useMemo(() => filesMap[params.engagementId] ?? [], [filesMap, params.engagementId]);
  const hasData = files.length > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-8 py-12">
        <div className="w-full max-w-lg text-center">
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted font-medium mb-1">
            {agentName}
          </p>
          <h2 className="text-xl font-semibold text-foreground mb-4 leading-tight">
            {deliverableName}
          </h2>
          <div className="rounded-xl border border-warning/20 bg-warning/5 p-6">
            <svg
              className="h-8 w-8 text-warning/60 mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm text-foreground/80 mb-2">
              Upload GL data to run analysis
            </p>
            <p className="text-xs text-muted mb-4">
              This analysis requires trial balance or posting history data.
              Upload files on the engagement dashboard.
            </p>
            <button
              onClick={() => router.push(`/${params.engagementId}`)}
              className="rounded-lg bg-warning/20 px-4 py-2 text-sm font-medium text-warning hover:bg-warning/30 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-8 py-12">
      <div className="w-full max-w-lg">
        {/* Deliverable + agent */}
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted font-medium">
            {agentName}
          </p>
          <span className="inline-flex items-center gap-1 rounded bg-blue-500/15 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-blue-400">
            <span className="h-1 w-1 rounded-full bg-blue-400 animate-pulse" />
            Live
          </span>
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-6 leading-tight">
          {deliverableName}
        </h2>

        <div className="rounded-xl border border-border/50 bg-surface/60 p-6">
          <p className="text-sm font-medium text-foreground/90 mb-4">
            Agent will analyze your data in real-time.
          </p>

          {/* Bullets */}
          <ul className="flex flex-col gap-2 mb-5">
            {bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-muted">
                <span className="mt-1 h-1 w-1 rounded-full bg-muted/50 shrink-0" />
                {bullet}
              </li>
            ))}
          </ul>

          {/* Data source badges */}
          <div className="border-t border-border/30 pt-4 mb-5">
            <span className="text-[10px] text-muted uppercase tracking-[0.1em] block mb-2">
              Data Sources
            </span>
            <div className="flex flex-col gap-2">
              {files.map((f) => (
                <DataSourceBadge key={f.id} file={f} />
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={onStart}
            className="w-full py-2.5 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent/90 active:bg-accent/80 transition-colors"
          >
            Run Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
