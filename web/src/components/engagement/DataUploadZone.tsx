"use client";

import { useState, useCallback, useRef } from "react";

interface DataUploadZoneProps {
  onFileAccepted: (file: File) => void;
  onUseSampleData: () => void;
}

const ACCEPTED_EXTENSIONS = [".xlsx", ".csv", ".xls"];

export function DataUploadZone({
  onFileAccepted,
  onUseSampleData,
}: DataUploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!ACCEPTED_EXTENSIONS.includes(ext)) return;
      onFileAccepted(file);
    },
    [onFileAccepted]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset input so the same file can be selected again
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      className={`
        relative cursor-pointer rounded-lg border-2 border-dashed px-6 py-8
        transition-all duration-200
        ${
          dragOver
            ? "border-accent bg-accent/5 shadow-[0_0_0_4px_rgba(59,130,246,0.08)]"
            : "border-border/40 hover:border-border/60 hover:bg-surface/30"
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.csv,.xls"
        onChange={handleInputChange}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-2 text-center">
        <div
          className={`text-2xl transition-transform duration-200 ${
            dragOver ? "scale-110" : ""
          }`}
        >
          <svg
            className="h-8 w-8 text-muted/40 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
        </div>

        <p className="text-sm text-muted">
          Drop <span className="font-mono text-foreground/70">.xlsx</span> or{" "}
          <span className="font-mono text-foreground/70">.csv</span> here, or
          click to browse
        </p>

        <p className="text-xs text-muted/60">
          Or{" "}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUseSampleData();
            }}
            className="text-accent hover:text-accent/80 transition-colors underline underline-offset-2"
          >
            use sample dataset
          </button>{" "}
          <span className="font-mono">(ACME P&C · 68 accts · 512K postings)</span>
        </p>
      </div>
    </div>
  );
}
