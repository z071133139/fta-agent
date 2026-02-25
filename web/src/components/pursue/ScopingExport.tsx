"use client";

import { useMemo } from "react";
import { getContextTile, getQuestionsForMode, getScopingThemes } from "@/lib/scoping-data";
import { useScopingStore } from "@/lib/scoping-store";

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function ScopingExport() {
  const exportJSON = useScopingStore((s) => s.exportJSON);
  const clientName = useScopingStore((s) => s.clientName);
  const scopingMode = useScopingStore((s) => s.scopingMode);
  const captures = useScopingStore((s) => s.themes);

  const summary = useMemo(() => {
    const tiles = [getContextTile(), ...getScopingThemes()];
    const answeredRapid = tiles.reduce((sum, tile) => {
      const capture = captures[tile.id];
      if (!capture) return sum;
      const count = getQuestionsForMode(tile, "rapid").filter(
        (q) => capture.questionResponses[q.id]?.answered === true,
      ).length;
      return sum + count;
    }, 0);
    const totalRapid = tiles.reduce(
      (sum, tile) => sum + getQuestionsForMode(tile, "rapid").length,
      0,
    );

    const themeRows = getScopingThemes()
      .map((theme) => {
        const capture = captures[theme.id];
        const unansweredDeep = getQuestionsForMode(theme, "deep").filter(
          (q) => capture?.questionResponses[q.id]?.answered !== true,
        );
        const score =
          (capture?.scopeSignal === "in" ? 3 : 0) +
          (capture?.painLevel === "critical" || capture?.painLevel === "significant" ? 2 : 0) +
          (capture?.priority === "high" ? 2 : capture?.priority === "medium" ? 1 : 0);
        return {
          id: theme.id,
          name: theme.name,
          unanswered: unansweredDeep.length,
          score,
        };
      })
      .sort((a, b) => b.score - a.score);

    const priorityThemes = themeRows
      .slice(0, 3)
      .map((x) => x.name);

    const meeting2Agenda = themeRows.filter((x) => x.unanswered > 0).slice(0, 4);

    const inScopeCount = Object.values(captures).filter(
      (c) => c.scopeSignal === "in",
    ).length;
    const highPainCount = Object.values(captures).filter(
      (c) => c.painLevel === "critical" || c.painLevel === "significant",
    ).length;

    return {
      answeredRapid,
      totalRapid,
      priorityThemes,
      meeting2Agenda,
      inScopeCount,
      highPainCount,
    };
  }, [captures]);

  function handleExportJSON() {
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

  function handleExportPDF() {
    const reportTitle = `${clientName || "Client"} Initial Scope Hypothesis`;
    const priority = summary.priorityThemes.length > 0
      ? summary.priorityThemes.join(", ")
      : "TBD";
    const agendaItems = summary.meeting2Agenda.length > 0
      ? summary.meeting2Agenda
          .map(
            (item) =>
              `<li><strong>${escapeHtml(item.name)}</strong> (${item.unanswered} unanswered deep-dive questions)</li>`,
          )
          .join("")
      : "<li>Deep-dive coverage already complete for top themes.</li>";
    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(reportTitle)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 32px; color: #0f172a; }
    h1 { margin: 0 0 8px; font-size: 24px; }
    h2 { margin: 24px 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #475569; }
    p { margin: 6px 0; font-size: 13px; line-height: 1.5; }
    ul { margin: 8px 0 0 20px; padding: 0; }
    li { margin: 4px 0; font-size: 13px; line-height: 1.4; }
    .muted { color: #64748b; }
    .box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-top: 10px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(reportTitle)}</h1>
  <p class="muted">Generated ${new Date().toLocaleString()} · Mode: ${escapeHtml(scopingMode)}</p>

  <div class="box">
    <h2>Initial Scope Hypothesis</h2>
    <p>Rapid capture coverage: <strong>${summary.answeredRapid}/${summary.totalRapid}</strong></p>
    <p>Priority themes: <strong>${escapeHtml(priority)}</strong></p>
    <p>Scope signal: <strong>${summary.inScopeCount}</strong> in-scope themes, <strong>${summary.highPainCount}</strong> high-pain areas.</p>
  </div>

  <div class="box">
    <h2>Meeting 2 Agenda</h2>
    <ul>${agendaItems}</ul>
  </div>
</body>
</html>`;

    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=980,height=760");
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleExportPDF}
        className="flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium bg-surface-alt text-muted hover:bg-accent/20 hover:text-accent transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9V2h12v7" />
          <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
          <path d="M6 14h12v8H6z" />
        </svg>
        Export Hypothesis PDF
      </button>

      <button
        onClick={handleExportJSON}
        className="flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium bg-surface-alt text-muted hover:bg-accent/20 hover:text-accent transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export JSON
      </button>
    </div>
  );
}
