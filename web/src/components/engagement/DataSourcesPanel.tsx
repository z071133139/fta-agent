"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDataStore, FILE_TYPE_DELIVERABLES, FILE_TYPE_LABELS, type DataFile } from "@/lib/data-store";
import { DataUploadZone } from "./DataUploadZone";
import { DataPreviewTable } from "./DataPreviewTable";

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

/** Map deliverable IDs to display names */
const DELIVERABLE_NAMES: Record<string, string> = {
  "d-005-01": "Account Analysis",
  "d-005-02": "COA Design",
  "d-005-03": "Account Mapping",
  "d-005-04": "Dimension Design",
  "d-005-06": "P&C Account Groups",
};

function FileCard({
  file,
  engagementId,
  onRemove,
}: {
  file: DataFile;
  engagementId: string;
  onRemove: () => void;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const usedBy = FILE_TYPE_DELIVERABLES[file.type]
    .map((id) => DELIVERABLE_NAMES[id])
    .filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-lg border border-border/40 bg-surface/60 overflow-hidden"
    >
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {/* File name */}
            <div className="flex items-center gap-2 mb-1">
              <svg
                className="h-4 w-4 text-muted/60 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
              <span className="text-sm font-medium text-foreground truncate">
                {file.name}
              </span>
              <span className="shrink-0 rounded bg-surface-alt/60 px-1.5 py-0.5 text-[9px] font-mono uppercase text-muted">
                {FILE_TYPE_LABELS[file.type]}
              </span>
            </div>

            {/* Metadata */}
            <p className="text-xs text-muted font-mono ml-6">
              {file.row_count.toLocaleString()} rows · {file.column_count} columns
              · {formatBytes(file.size_bytes)} · Uploaded {relativeTime(file.uploaded_at)}
            </p>

            {/* Used by */}
            {usedBy.length > 0 && (
              <p className="text-[11px] text-muted/70 ml-6 mt-1">
                Used by:{" "}
                {usedBy.map((name, i) => (
                  <span key={name}>
                    <span className="text-foreground/60">{name}</span>
                    {i < usedBy.length - 1 && ", "}
                  </span>
                ))}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setPreviewOpen(!previewOpen)}
              className="rounded px-2.5 py-1 text-xs text-muted hover:text-foreground hover:bg-surface-alt/50 transition-colors"
            >
              {previewOpen ? "Hide" : "Preview"}
            </button>
            <button
              onClick={onRemove}
              className="rounded px-2.5 py-1 text-xs text-muted/60 hover:text-error hover:bg-error/5 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* Preview table */}
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
    </motion.div>
  );
}

export function DataSourcesPanel({
  engagementId,
}: {
  engagementId: string;
}) {
  const filesMap = useDataStore((s) => s.files);
  const addFile = useDataStore((s) => s.addFile);
  const removeFile = useDataStore((s) => s.removeFile);
  const loadSampleData = useDataStore((s) => s.loadSampleData);
  const files = useMemo(() => filesMap[engagementId] ?? [], [filesMap, engagementId]);

  const handleFileAccepted = useCallback(
    (file: File) => {
      // Mock upload — accept any file, create synthetic metadata
      const mockFile: DataFile = {
        id: `upload-${Date.now()}`,
        name: file.name,
        size_bytes: file.size,
        row_count: Math.floor(Math.random() * 100_000) + 10_000,
        column_count: Math.floor(Math.random() * 20) + 10,
        uploaded_at: new Date().toISOString(),
        type: file.name.toLowerCase().includes("coa") ? "coa_extract" : "trial_balance",
      };
      addFile(engagementId, mockFile);
    },
    [engagementId, addFile]
  );

  const handleUseSampleData = useCallback(() => {
    loadSampleData(engagementId);
  }, [engagementId, loadSampleData]);

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-[10px] uppercase tracking-[0.15em] text-muted font-medium">
          Data Sources
        </h3>
        <div className="flex-1 h-px bg-border/30" />
        {files.length > 0 && (
          <span className="text-[10px] font-mono text-muted/60">
            {files.length} file{files.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* File list */}
      <div className="flex flex-col gap-3 mb-4">
        <AnimatePresence mode="popLayout">
          {files.map((f) => (
            <FileCard
              key={f.id}
              file={f}
              engagementId={engagementId}
              onRemove={() => removeFile(engagementId, f.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Upload zone */}
      <DataUploadZone
        onFileAccepted={handleFileAccepted}
        onUseSampleData={handleUseSampleData}
      />
    </div>
  );
}
