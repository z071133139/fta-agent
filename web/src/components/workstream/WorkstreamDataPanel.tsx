"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Workstream } from "@/lib/mock-data";
import {
  useDataStore,
  type DataFile,
  SAMPLE_DATA_FILE,
  FILE_TYPE_LABELS,
} from "@/lib/data-store";
import {
  type WorkstreamDataRequirements,
  type WorkstreamFileRequirement,
  DELIVERABLE_NAMES,
} from "@/lib/workstream-data-config";
import { DataUploadZone } from "@/components/engagement/DataUploadZone";
import { DataPreviewTable } from "@/components/engagement/DataPreviewTable";

// ── Agent label map ──────────────────────────────────────────────────────────

const AGENT_LABEL: Record<string, string> = {
  gl_design_coach: "GL Design Coach",
  functional_consultant: "Functional Consultant",
  consulting_agent: "Consulting Agent",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// ── Requirement Card ─────────────────────────────────────────────────────────

function RequirementCard({
  req,
  file,
  engagementId,
  onFileAccepted,
  onUseSampleData,
  onRemoveFile,
}: {
  req: WorkstreamFileRequirement;
  file: DataFile | undefined;
  engagementId: string;
  onFileAccepted: (file: File, type: DataFile["type"]) => void;
  onUseSampleData: () => void;
  onRemoveFile: (fileId: string) => void;
}) {
  const uploaded = !!file;
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/40 bg-surface/60 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/20">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-medium text-foreground">{req.label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${
              uploaded ? "bg-success" : "bg-muted/40"
            }`}
          />
          <span
            className={`text-[10px] font-medium ${
              uploaded ? "text-success" : "text-muted"
            }`}
          >
            {uploaded ? "Uploaded" : "Not uploaded"}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        <p className="text-xs text-muted leading-relaxed mb-3">
          {req.description}
        </p>

        {/* Required for */}
        <div className="flex items-center gap-1.5 mb-4">
          <span className="text-[10px] text-muted/60 shrink-0">Required for:</span>
          <div className="flex flex-wrap gap-1">
            {req.required_for.map((dId) => (
              <span
                key={dId}
                className="rounded bg-surface-alt/60 px-1.5 py-0.5 text-[10px] font-mono text-muted"
              >
                {DELIVERABLE_NAMES[dId] ?? dId}
              </span>
            ))}
          </div>
        </div>

        {/* File card or upload zone */}
        {uploaded ? (
          <div className="rounded-lg border border-border/30 bg-surface/40 overflow-hidden">
            <div className="flex items-center gap-2.5 px-4 py-2.5">
              <svg
                className="h-4 w-4 text-success shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-foreground/90 font-medium truncate">
                  {file.name}
                </p>
                <p className="text-[10px] font-mono text-muted">
                  {file.row_count.toLocaleString()} rows · {file.column_count} columns · {formatBytes(file.size_bytes)} · {relativeTime(file.uploaded_at)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setPreviewOpen(!previewOpen)}
                  className="rounded px-2.5 py-1 text-xs text-muted hover:text-foreground hover:bg-surface-alt/50 transition-colors"
                >
                  {previewOpen ? "Hide" : "Preview"}
                </button>
                <button
                  onClick={() => onRemoveFile(file.id)}
                  className="rounded px-2.5 py-1 text-xs text-muted/60 hover:text-error hover:bg-error/5 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Expandable preview */}
            <AnimatePresence>
              {previewOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden border-t border-border/20"
                >
                  <div className="px-4 pb-3">
                    <DataPreviewTable />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <DataUploadZone
            onFileAccepted={(f) => onFileAccepted(f, req.type)}
            onUseSampleData={onUseSampleData}
            compact
          />
        )}
      </div>
    </motion.div>
  );
}

// ── Deliverable Readiness Table ──────────────────────────────────────────────

function DeliverableReadinessTable({
  workstream,
  config,
  uploadedTypes,
  engagementId,
}: {
  workstream: Workstream;
  config: WorkstreamDataRequirements | undefined;
  uploadedTypes: Set<DataFile["type"]>;
  engagementId: string;
}) {
  const router = useRouter();

  // Build map: deliverable → required types
  const reqMap = useMemo(() => {
    const m = new Map<string, DataFile["type"][]>();
    if (!config) return m;
    for (const req of config.requirements) {
      for (const dId of req.required_for) {
        const existing = m.get(dId) ?? [];
        existing.push(req.type);
        m.set(dId, existing);
      }
    }
    return m;
  }, [config]);

  return (
    <div className="rounded-xl border border-border/40 bg-surface/60 overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border/30">
            <th className="px-5 py-2.5 text-[10px] uppercase tracking-[0.1em] text-muted font-medium">
              Deliverable
            </th>
            <th className="px-5 py-2.5 text-[10px] uppercase tracking-[0.1em] text-muted font-medium">
              Requires
            </th>
            <th className="px-5 py-2.5 text-[10px] uppercase tracking-[0.1em] text-muted font-medium text-right">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {workstream.deliverables.map((d) => {
            const requiredTypes = reqMap.get(d.deliverable_id) ?? [];
            const missingTypes = requiredTypes.filter(
              (t) => !uploadedTypes.has(t)
            );
            const isReady = missingTypes.length === 0;

            return (
              <tr
                key={d.deliverable_id}
                onClick={() =>
                  router.push(
                    `/${engagementId}/deliverables/${d.deliverable_id}`
                  )
                }
                className="border-b border-border/10 last:border-b-0 cursor-pointer hover:bg-surface-alt/30 transition-colors"
              >
                <td className="px-5 py-2.5 text-xs text-foreground/90">
                  {d.name}
                </td>
                <td className="px-5 py-2.5">
                  <div className="flex gap-1">
                    {requiredTypes.length === 0 ? (
                      <span className="text-[10px] text-muted/50 italic">
                        None
                      </span>
                    ) : (
                      requiredTypes.map((t) => (
                        <span
                          key={t}
                          className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${
                            uploadedTypes.has(t)
                              ? "bg-success/10 text-success"
                              : "bg-warning/10 text-warning"
                          }`}
                        >
                          {FILE_TYPE_LABELS[t]}
                        </span>
                      ))
                    )}
                  </div>
                </td>
                <td className="px-5 py-2.5 text-right">
                  {requiredTypes.length === 0 ? (
                    <span className="text-[10px] text-muted/50">-</span>
                  ) : isReady ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-success">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                      Ready
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-warning">
                      Needs {missingTypes.map((t) => FILE_TYPE_LABELS[t]).join(", ")}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main Panel ───────────────────────────────────────────────────────────────

export function WorkstreamDataPanel({
  engagementId,
  workstream,
  config,
}: {
  engagementId: string;
  workstream: Workstream;
  config: WorkstreamDataRequirements | undefined;
}) {
  const filesMap = useDataStore((s) => s.files);
  const addFile = useDataStore((s) => s.addFile);
  const removeFile = useDataStore((s) => s.removeFile);
  const loadSampleData = useDataStore((s) => s.loadSampleData);
  const files = useMemo(
    () => filesMap[engagementId] ?? [],
    [filesMap, engagementId]
  );
  const uploadedTypes = useMemo(
    () => new Set(files.map((f) => f.type)),
    [files]
  );

  const agentLabel =
    AGENT_LABEL[workstream.owner_agent ?? "consulting_agent"] ??
    "Consulting Agent";

  const handleFileAccepted = useCallback(
    (file: File, type: DataFile["type"]) => {
      const mockFile: DataFile = {
        id: `upload-${Date.now()}`,
        name: file.name,
        size_bytes: file.size,
        row_count: Math.floor(Math.random() * 100_000) + 10_000,
        column_count: Math.floor(Math.random() * 20) + 10,
        uploaded_at: new Date().toISOString(),
        type,
      };
      addFile(engagementId, mockFile);
    },
    [engagementId, addFile]
  );

  const handleUseSampleData = useCallback(() => {
    loadSampleData(engagementId);
  }, [engagementId, loadSampleData]);

  // Find file per requirement
  const fileByType = useMemo(() => {
    const m = new Map<DataFile["type"], DataFile>();
    for (const f of files) {
      if (!m.has(f.type)) m.set(f.type, f);
    }
    return m;
  }, [files]);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.15em] text-muted font-medium mb-1">
          {agentLabel}
        </p>
        <h1 className="text-xl font-semibold text-foreground">
          {workstream.name}
        </h1>
      </div>

      {/* Data Requirements */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-muted font-medium">
            Data Requirements
          </h2>
          <div className="flex-1 h-px bg-border/30" />
        </div>

        {config ? (
          <div className="flex flex-col gap-4">
            {config.requirements.map((req) => (
              <RequirementCard
                key={req.type}
                req={req}
                file={fileByType.get(req.type)}
                engagementId={engagementId}
                onFileAccepted={handleFileAccepted}
                onUseSampleData={handleUseSampleData}
                onRemoveFile={(fileId) => removeFile(engagementId, fileId)}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted">
            No data requirements configured for this workstream.
          </p>
        )}
      </div>

      {/* Deliverable Readiness */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-muted font-medium">
            Deliverables
          </h2>
          <div className="flex-1 h-px bg-border/30" />
        </div>

        <DeliverableReadinessTable
          workstream={workstream}
          config={config}
          uploadedTypes={uploadedTypes}
          engagementId={engagementId}
        />
      </div>
    </div>
  );
}
