"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import type { ProcessFlowData, ProcessFlowNode, ProcessFlowEdge, ProcessOverlayKind } from "@/lib/mock-data";
import { useFlowLayout } from "./process-flow/useFlowLayout";
import { useFlowViewport } from "./process-flow/useFlowViewport";
import { FlowEdgeLayer } from "./process-flow/FlowEdgeLayer";
import { FlowNodeLayer } from "./process-flow/FlowNodeLayer";
import { useWorkshopStore } from "@/lib/workshop-store";

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
      <span className="px-2 py-1.5 text-[10px] font-mono text-muted min-w-[42px] text-center select-none">
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
        <span className="text-[9px] uppercase tracking-[0.12em] font-medium text-muted">
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

  // Workshop store
  const workshopMode = useWorkshopStore((s) => s.workshopMode);
  const recordFlowNodeEdit = useWorkshopStore((s) => s.recordFlowNodeEdit);
  const flagFlowNodeGap = useWorkshopStore((s) => s.flagFlowNodeGap);
  const flowNodeChanges = useWorkshopStore((s) => s.flowNodeChanges);
  const newFlowNodes = useWorkshopStore((s) => s.newFlowNodes);
  const placedFlowNodes = useWorkshopStore((s) => s.placedFlowNodes);
  const placeFlowNode = useWorkshopStore((s) => s.placeFlowNode);
  const deletedFlowNodeIds = useWorkshopStore((s) => s.deletedFlowNodeIds);
  const deleteFlowNode = useWorkshopStore((s) => s.deleteFlowNode);

  // Compute extra nodes/edges from placed flow nodes + deleted nodes
  const layoutOptions = useMemo(() => {
    const hasPlaced = placedFlowNodes.length > 0;
    const hasDeleted = deletedFlowNodeIds.size > 0;
    if (!hasPlaced && !hasDeleted) return undefined;

    const extraNodes: ProcessFlowNode[] = [];
    const extraEdges: ProcessFlowEdge[] = [];
    const removeEdgeIds = new Set<string>();
    const removeNodeIds = new Set(deletedFlowNodeIds);

    // Handle placed nodes — split edges
    for (const placed of placedFlowNodes) {
      extraNodes.push(placed.node);

      // Find the edge that goes FROM afterNodeId and split it
      const outEdge = data.edges.find((e) => e.source === placed.afterNodeId);
      if (outEdge) {
        removeEdgeIds.add(outEdge.id);
        extraEdges.push({
          id: `we-${placed.node.id}-in`,
          source: placed.afterNodeId,
          target: placed.node.id,
        });
        extraEdges.push({
          id: `we-${placed.node.id}-out`,
          source: placed.node.id,
          target: outEdge.target,
        });
      } else {
        extraEdges.push({
          id: `we-${placed.node.id}-in`,
          source: placed.afterNodeId,
          target: placed.node.id,
        });
      }
    }

    // Handle deleted nodes — bridge their incoming/outgoing edges
    for (const delId of deletedFlowNodeIds) {
      // Find edges INTO the deleted node
      const inEdges = data.edges.filter((e) => e.target === delId);
      // Find edges OUT of the deleted node
      const outEdges = data.edges.filter((e) => e.source === delId);

      // Remove all edges touching the deleted node
      for (const e of inEdges) removeEdgeIds.add(e.id);
      for (const e of outEdges) removeEdgeIds.add(e.id);

      // Bridge: connect each source to each target
      for (const inE of inEdges) {
        for (const outE of outEdges) {
          extraEdges.push({
            id: `wd-${delId}-${inE.source}-${outE.target}`,
            source: inE.source,
            target: outE.target,
          });
        }
      }
    }

    return { extraNodes, extraEdges, removeEdgeIds, removeNodeIds };
  }, [placedFlowNodes, deletedFlowNodeIds, data.edges]);

  const layout = useFlowLayout(data, layoutOptions);
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
  const [placingNodeId, setPlacingNodeId] = useState<string | null>(null);
  const [gapNotesNodeId, setGapNotesNodeId] = useState<string | null>(null);
  const [gapNotesDraft, setGapNotesDraft] = useState("");

  const handleSelect = useCallback((id: string) => {
    // If in placing mode, this click means "insert after this node"
    if (placingNodeId) {
      const targetNode = data.nodes.find((n) => n.id === id) ??
        placedFlowNodes.find((p) => p.node.id === id)?.node;
      const role = targetNode?.role ?? data.swimlanes?.[0] ?? "";
      placeFlowNode(placingNodeId, id, role);
      setPlacingNodeId(null);
      return;
    }
    setSelectedId(id);
    setEditingId(null);
  }, [placingNodeId, placeFlowNode, data.nodes, data.swimlanes, placedFlowNodes]);

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
      // Record in workshop store if active
      if (workshopMode) {
        recordFlowNodeEdit(editingId, trimmed);
      }
    }
    setEditingId(null);
  }, [editingId, editDraft, workshopMode, recordFlowNodeEdit]);

  const handleEditCancel = useCallback(() => {
    setEditingId(null);
  }, []);

  // Merge gap flags and notes from workshop store
  const mergedLabels = { ...labels };
  const gapNodeIds = new Set<string>();
  const gapNotesMap = new Map<string, string>();
  if (workshopMode) {
    for (const [nodeId, change] of flowNodeChanges) {
      if (change.gapFlagged) {
        gapNodeIds.add(nodeId);
        if (change.gapNotes) gapNotesMap.set(nodeId, change.gapNotes);
      }
      if (change.newLabel && !labels[nodeId]) {
        mergedLabels[nodeId] = change.newLabel;
      }
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't hijack when textarea is focused
      if (editingId) return;
      if (e.target instanceof HTMLTextAreaElement) return;
      if (e.target instanceof HTMLInputElement) return;

      // In workshop mode, F key is handled by useWorkshopKeyboard
      if (!workshopMode) {
        if (e.key === "f" || e.key === "F") fitView();
      }
      if (e.key === "=" || e.key === "+") zoomIn();
      if (e.key === "-") zoomOut();
      if (e.key === "Escape") {
        if (gapNotesNodeId) {
          setGapNotesNodeId(null);
          return;
        }
        setSelectedId(null);
        setEditingId(null);
        setPlacingNodeId(null);
      }

      // G key for gap flag in workshop mode
      if (workshopMode && (e.key === "g" || e.key === "G") && selectedId) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA") {
          // Check if already flagged — toggle off
          const existing = flowNodeChanges.get(selectedId);
          if (existing?.gapFlagged) {
            flagFlowNodeGap(selectedId);
            setGapNotesNodeId(null);
          } else {
            // Open gap notes input
            setGapNotesNodeId(selectedId);
            setGapNotesDraft("");
          }
        }
      }

      // Delete/Backspace/D to delete selected node in workshop mode
      if (workshopMode && selectedId && (e.key === "Delete" || e.key === "Backspace" || e.key === "d" || e.key === "D")) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA") {
          e.preventDefault();
          deleteFlowNode(selectedId);
          setSelectedId(null);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editingId, fitView, zoomIn, zoomOut, workshopMode, selectedId, flagFlowNodeGap, deleteFlowNode, flowNodeChanges, gapNotesNodeId]);

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

  // In workshop mode, also gather agentic insight for selected node
  const selectedNodeAgentData = useMemo(() => {
    if (!workshopMode || !selectedId) return null;
    const node = data.nodes.find((n) => n.id === selectedId);
    if (!node) return null;
    // Node status tells us if it's leading practice vs client overlay
    const overlays = (data.overlays ?? []).filter((o) => o.node_id === selectedId);
    const agentOverlays = overlays.filter((o) => o.source === "gl_finding" || o.source === "agent_elicited");
    if (agentOverlays.length === 0 && node.status !== "leading_practice") return null;
    return { node, agentOverlays, isLeadingPractice: node.status === "leading_practice" };
  }, [workshopMode, selectedId, data.nodes, data.overlays]);

  return (
    <div
      ref={vpRef}
      className="relative w-full h-full overflow-hidden bg-background"
      style={{ cursor: placingNodeId ? "crosshair" : "default" }}
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
          labels={mergedLabels}
          gapNodeIds={gapNodeIds}
          gapNotes={gapNotesMap}
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

      {/* Workshop agent insight chips — positioned near selected node */}
      {workshopMode && selectedNodeAgentData && !editingId && !gapNotesNodeId && (() => {
        const nd = layout.nodeMap.get(selectedId!);
        if (!nd) return null;
        const sx = nd.x * zoom + panX;
        const sy = (nd.y + nd.h) * zoom + panY + 12;
        const { agentOverlays, isLeadingPractice } = selectedNodeAgentData;
        // Don't double-show with the regular overlay panel
        const alreadyShown = showOverlay;

        return (
          <div
            className="absolute z-30 w-[300px]"
            style={{ left: sx, top: alreadyShown ? sy + 160 : sy }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-surface/95 border border-[#8B5CF6]/20 rounded-lg shadow-xl overflow-hidden backdrop-blur-sm">
              <div className="px-3 py-2 border-b border-border/30 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6] agent-thinking" />
                <span className="text-[9px] uppercase tracking-[0.12em] text-[#8B5CF6] font-semibold">
                  Agent Insight
                </span>
                {isLeadingPractice && (
                  <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-[#3B82F6]/15 text-[#3B82F6]">
                    Leading Practice
                  </span>
                )}
              </div>
              <div className="p-2.5 space-y-1.5">
                {agentOverlays.map((ov) => {
                  const isGapFlagged = flowNodeChanges.get(ov.node_id)?.gapFlagged;
                  return (
                    <button
                      key={ov.id}
                      onClick={() => {
                        if (!isGapFlagged) {
                          // Use the overlay text as gap notes
                          flagFlowNodeGap(ov.node_id, ov.text);
                        }
                      }}
                      className="group flex items-start gap-2 w-full text-left px-2.5 py-2 rounded-md border border-border/30 hover:border-[#EF4444]/30 hover:bg-[#EF4444]/5 transition-colors"
                    >
                      <span className="text-[8px] font-mono mt-0.5 shrink-0" style={{
                        color: ov.source === "gl_finding" ? "#10B981" : "#8B5CF6"
                      }}>
                        {ov.source === "gl_finding" ? "GL" : "AI"}
                      </span>
                      <span className="text-[10px] text-muted leading-relaxed flex-1">
                        {ov.text}
                      </span>
                      <span className="text-[8px] shrink-0 mt-0.5 transition-colors" style={{
                        color: isGapFlagged ? "#10B981" : "rgba(148,163,184,0.5)"
                      }}>
                        {isGapFlagged ? "flagged" : "→ flag gap"}
                      </span>
                    </button>
                  );
                })}
                {agentOverlays.length === 0 && isLeadingPractice && (
                  <p className="text-[10px] text-muted/60 px-1">
                    This step follows leading practice — no gaps identified.
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Gap notes input panel — positioned near the selected node */}
      {gapNotesNodeId && (() => {
        const gapNode = layout.nodeMap.get(gapNotesNodeId);
        if (!gapNode) return null;
        const sx = gapNode.x * zoom + panX;
        const sy = (gapNode.y + gapNode.h) * zoom + panY + 12;
        return (
          <div
            className="absolute z-40 w-[300px] bg-surface border border-[#EF4444]/40 rounded-lg shadow-2xl overflow-hidden"
            style={{ left: sx, top: sy }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-2 border-b border-border/40 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#EF4444]" />
              <span className="text-[10px] uppercase tracking-[0.1em] font-semibold text-[#EF4444]">
                Flag Gap
              </span>
              <span className="text-[10px] text-muted ml-auto font-mono">
                {gapNode.raw.label.slice(0, 30)}{gapNode.raw.label.length > 30 ? "…" : ""}
              </span>
            </div>
            <div className="p-3">
              <textarea
                autoFocus
                value={gapNotesDraft}
                onChange={(e) => setGapNotesDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    const trimmed = gapNotesDraft.trim();
                    if (trimmed) {
                      flagFlowNodeGap(gapNotesNodeId, trimmed);
                      setGapNotesNodeId(null);
                    }
                  }
                  if (e.key === "Escape") {
                    setGapNotesNodeId(null);
                  }
                }}
                placeholder="Describe the gap — what's missing or needs change…"
                className="w-full bg-surface-alt/50 border border-border/40 rounded px-2.5 py-2 text-[11px] text-foreground placeholder:text-muted/50 font-sans resize-none focus:outline-none focus:border-[#EF4444]/40"
                rows={3}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[9px] font-mono text-muted/60">
                  Enter to flag · Esc to cancel
                </span>
                <button
                  onClick={() => {
                    const trimmed = gapNotesDraft.trim();
                    if (trimmed) {
                      flagFlowNodeGap(gapNotesNodeId, trimmed);
                      setGapNotesNodeId(null);
                    }
                  }}
                  className="text-[9px] font-mono px-2 py-1 rounded bg-[#EF4444]/15 text-[#EF4444] hover:bg-[#EF4444]/25 transition-colors"
                >
                  Flag Gap
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Name badge */}
      <div className="absolute top-3 left-3 z-20">
        <span className="text-[9px] font-mono text-muted bg-surface/80 border border-border/40 rounded px-2 py-1 backdrop-blur-sm">
          {data.name}
        </span>
      </div>

      {/* Hint */}
      <div className="absolute bottom-4 left-4 z-10">
        <span className="text-[9px] font-mono text-muted/70 select-none">
          {workshopMode
            ? "double-click to edit · G gap · D delete · scroll to zoom"
            : "scroll to zoom · space+drag to pan · double-click to edit"}
        </span>
      </div>

      {/* Zoom controls */}
      <ZoomControls
        zoom={zoom}
        onFit={fitView}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
      />

      {/* Placing mode indicator */}
      {placingNodeId && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
          <div className="bg-accent/20 border border-accent/40 rounded-lg px-4 py-2 backdrop-blur-sm">
            <span className="text-[11px] font-mono text-accent">
              Click a node to insert after · Esc to cancel
            </span>
          </div>
        </div>
      )}

      {/* Captured steps tray — workshop mode only */}
      {workshopMode && newFlowNodes.length > 0 && (
        <div className="absolute top-3 right-3 z-20 max-w-[280px]">
          <div className="bg-surface/95 border border-border/60 rounded-lg p-2.5 backdrop-blur-sm shadow-lg">
            <p className="text-[8px] uppercase tracking-[0.12em] text-[#F59E0B] font-semibold mb-2">
              Captured Steps ({newFlowNodes.length})
            </p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {newFlowNodes.map((node) => (
                <div
                  key={node.id}
                  className={[
                    "flex items-center gap-2 px-2 py-1.5 rounded border transition-colors",
                    placingNodeId === node.id
                      ? "bg-accent/15 border-accent/40"
                      : "bg-surface-alt/40 border-border/30",
                  ].join(" ")}
                >
                  <span className="text-[8px] font-mono text-muted/60">{node.id}</span>
                  <span className="text-[10px] text-foreground/80 truncate flex-1">{node.label}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlacingNodeId(placingNodeId === node.id ? null : node.id);
                    }}
                    className="text-[8px] font-mono px-1.5 py-0.5 rounded transition-colors shrink-0"
                    style={
                      placingNodeId === node.id
                        ? { backgroundColor: "rgba(59,130,246,0.2)", color: "#3B82F6" }
                        : { backgroundColor: "rgba(16,185,129,0.15)", color: "#10B981" }
                    }
                  >
                    {placingNodeId === node.id ? "Cancel" : "Place"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
