"use client";

import { useScopingStore } from "@/lib/scoping-store";

export function ScopingExport() {
  const exportJSON = useScopingStore((s) => s.exportJSON);
  const clientName = useScopingStore((s) => s.clientName);

  function handleExport() {
    const json = exportJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const slug = (clientName || "scoping-session")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+$/, "");
    a.download = `${slug}-scoping-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium bg-surface-alt text-muted hover:bg-accent/20 hover:text-accent transition-colors"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Export Scoping Summary
    </button>
  );
}
