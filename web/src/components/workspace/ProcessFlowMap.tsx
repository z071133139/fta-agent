"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { ProcessFlowData, ProcessOverlayKind } from "@/lib/mock-data";
import { useFlowLayout } from "./process-flow/useFlowLayout";
import { useFlowViewport } from "./process-flow/useFlowViewport";
import { FlowEdgeLayer } from "./process-flow/FlowEdgeLayer";
import { FlowNodeLayer } from "./process-flow/FlowNodeLayer";

// ── Overlay kind config ───────────────────────────────────────────────────────

const OV_CFG: Record<
  ProcessOverlayKind,
  { label: string; cls: string }
> = {
  constraint: { label: "Constraint", cls: "bg-[#F59E0B]/15 text-[#F59E0B]" },
  requirement: { label: "Requirement", cls: "bg-[#3B82F6]/15 text-[#3B82F6]" },
  exception: { label: "Exception", cls: "bg-[#A855F7]/15 text-[#A855F7]" },
  risk: { label: "Risk", cls: "bg-[#EF4444]/15 text-[#EF4444]" },
};

// ── Zoom controls ─────────────────────────────────────────────────────────────

function ZoomControls({
  zoom,
  onFit,
  onZoomIn,
  onZoomOut,
}: {
  zoom: number;
  onFit: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  const btn =
    "px-2.5 py-1.5 text-muted hover:text-foreground hover:bg-surface-alt transition-colors";
  return (
    <div className="absolute bottom-4 right-4 flex items-center bg-surface border border-border rounded-lg overflow-hidden shadow-lg z-20">
      <button onClick={onFit} className={`${btn} text-[9px] font-mono`} title="Fit view (F)">
        fit
      </button>
      <div className="w-px h-4 bg-border" />
      <button onClick={onZoomOut} className={`${btn} text-[13px] leading-none`} title="Zoom out (−)">
        −
      </button>
      <span className="px-2 py-1.5 text-[10px] font-mono text-muted/50 min-w-[42px] text-center select-none">
        {Math.round(zoom * 100)}%
      </span>
      <button onClick={onZoomIn} className={`${btn} text-[13px] leading-none`} title="Zoom in (+)">
        +
      </button>
    </div>
  );
}

// ── Overlay panel ─────────────────────────────────────────────────────────────

function OverlayPanel({
  nodeId,
  layout,
  panX,
  panY,
  zoom,
  onClose,
}: {
  nodeId: string;
  layout: ReturnType<typeof useFlowLayout>;
  panX: number;
  panY: number;
  zoom: number;
  onClose: () => void;
}) {
  const node = layout.nodeMap.get(nodeId);
  if (!node || node.overlays.length === 0) return null;

  // Convert canvas coords to viewport (screen) coords
  const screenX = node.x * zoom + panX;
  const screenY = (node.y + node.h) * zoom + panY + 10;

  const PANEL_W = 280;

  return (
    <div
      className="absolute bg-surface border border-border rounded-xl shadow-2xl p-3.5 space-y-3 z-30"
      style={{ left: screenX, top: screenY, width: PANEL_W }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-[0.12em] font-medium text-muted/60">
          {node.overlays.length} annotation{node.overlays.length > 1 ? "s" : ""}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="text-muted hover:text-foreground text-[11px] leading-none transition-colors"
        >
          ✕
        </button>
      </div>

      {node.overlays.map((ov) => {
        const cfg = OV_CFG[ov.kind];
        return (
          <div key={ov.id} className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[8px] uppercase tracking-[0.1em] font-medium px-1.5 py-0.5 rounded ${cfg.cls}`}
              >
                {cfg.label}
              </span>
              {ov.source === "gl_finding" && (
                <span className="text-[8px] bg-[#10B981]/10 text-[#10B981] px-1.5 py-0.5 rounded font-mono">
                  ↗ GL Analysis
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted leading-relaxed">{ov.text}</p>
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ProcessFlowMap({ data }: { data: ProcessFlowData }) {
  const vpRef = useRef<HTMLDivElement>(null);
  const layout = useFlowLayout(data);
  const { panX, panY, zoom, fitView, zoomIn, zoomOut } = useFlowViewport(
    vpRef,
    layout.canvasW,
    layout.canvasH
  );

  // Interaction state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [labels, setLabels] = useState<Record<string, string>>({});

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setEditingId(null);
  }, []);

  const handleDeselect = useCallback(() => {
    if (editingId) return; // blur on textarea will handle commit
    setSelectedId(null);
  }, [editingId]);

  const handleDoubleClick = useCallback((id: string, currentLabel: string) => {
    setEditingId(id);
    setEditDraft(currentLabel);
    setSelectedId(id);
  }, []);

  const handleEditCommit = useCallback(() => {
    if (!editingId) return;
    const trimmed = editDraft.trim();
    if (trimmed) {
      setLabels((prev) => ({ ...prev, [editingId]: trimmed }));
    }
    setEditingId(null);
  }, [editingId, editDraft]);

  const handleEditCancel = useCallback(() => {
    setEditingId(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't hijack when textarea is focused
      if (editingId) return;
      if (e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "f" || e.key === "F") fitView();
      if (e.key === "=" || e.key === "+") zoomIn();
      if (e.key === "-") zoomOut();
      if (e.key === "Escape") {
        setSelectedId(null);
        setEditingId(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editingId, fitView, zoomIn, zoomOut]);

  const canvasStyle: React.CSSProperties = {
    position: "absolute",
    transformOrigin: "0 0",
    transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
    width: layout.canvasW,
    height: layout.canvasH,
    willChange: "transform",
  };

  const selectedNode = selectedId ? layout.nodeMap.get(selectedId) : null;
  const showOverlay =
    selectedNode !== undefined &&
    selectedNode !== null &&
    selectedNode.overlays.length > 0 &&
    !editingId;

  return (
    <div
      ref={vpRef}
      className="relative w-full h-full overflow-hidden bg-background"
      style={{ cursor: "default" }}
    >
      {/* Canvas — pan/zoom transform applied here */}
      <div style={canvasStyle}>
        <FlowEdgeLayer layout={layout} selectedId={selectedId} />
        <FlowNodeLayer
          nodes={layout.nodes}
          swimlanes={layout.swimlanes}
          selectedId={selectedId}
          editingId={editingId}
          editDraft={editDraft}
          labels={labels}
          onSelect={handleSelect}
          onDeselect={handleDeselect}
          onDoubleClick={handleDoubleClick}
          onEditChange={setEditDraft}
          onEditCommit={handleEditCommit}
          onEditCancel={handleEditCancel}
        />
      </div>

      {/* Overlay panel — outside canvas transform so it's unaffected by zoom */}
      {showOverlay && (
        <OverlayPanel
          nodeId={selectedId!}
          layout={layout}
          panX={panX}
          panY={panY}
          zoom={zoom}
          onClose={() => setSelectedId(null)}
        />
      )}

      {/* Name badge */}
      <div className="absolute top-3 left-3 z-20">
        <span className="text-[9px] font-mono text-muted bg-surface/80 border border-border/40 rounded px-2 py-1 backdrop-blur-sm">
          {data.name}
        </span>
      </div>

      {/* Hint */}
      <div className="absolute bottom-4 left-4 z-10">
        <span className="text-[9px] font-mono text-muted/25 select-none">
          scroll to zoom · space+drag to pan · double-click to edit
        </span>
      </div>

      {/* Zoom controls */}
      <ZoomControls
        zoom={zoom}
        onFit={fitView}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
      />
    </div>
  );
}
