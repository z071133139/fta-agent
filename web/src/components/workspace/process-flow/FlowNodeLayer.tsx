"use client";

import React, { useRef } from "react";
import type { NodeLayout, SwimlaneLayout } from "./useFlowLayout";
import { LABEL_COL_W, GW, SE } from "./useFlowLayout";

// ── Config ────────────────────────────────────────────────────────────────────

const STATUS_STRIPE: Record<string, string> = {
  leading_practice: "#3B82F6",
  client_overlay: "#F59E0B",
  gap: "#EF4444",
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface LayerProps {
  nodes: NodeLayout[];
  swimlanes: SwimlaneLayout[];
  selectedId: string | null;
  editingId: string | null;
  editDraft: string;
  labels: Record<string, string>;
  gapNodeIds?: Set<string>;
  gapNotes?: Map<string, string>;
  onSelect: (id: string) => void;
  onDeselect: () => void;
  onDoubleClick: (id: string, currentLabel: string) => void;
  onEditChange: (value: string) => void;
  onEditCommit: () => void;
  onEditCancel: () => void;
}

// ── Swimlane background ───────────────────────────────────────────────────────

const SwimlaneBand = React.memo(function SwimlaneBand({
  lane,
  isLast,
}: {
  lane: SwimlaneLayout;
  isLast: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: lane.y,
        width: lane.w,
        height: lane.h,
        pointerEvents: "none", // never intercept clicks
        borderTop: "1px solid rgba(71,85,105,0.3)",
        borderBottom: isLast ? "1px solid rgba(71,85,105,0.3)" : "none",
        backgroundColor: "rgba(15,23,42,0.3)",
      }}
    >
      {/* Lane label column */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: LABEL_COL_W,
          borderRight: "1px solid rgba(71,85,105,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 9,
            fontFamily: "'DM Sans', system-ui, sans-serif",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#94A3B8",
            fontWeight: 600,
            writingMode: "vertical-lr",
            transform: "rotate(180deg)",
          }}
        >
          {lane.label}
        </span>
      </div>
    </div>
  );
});

// ── Task node ─────────────────────────────────────────────────────────────────

interface TaskNodeProps {
  node: NodeLayout;
  label: string;
  selected: boolean;
  editing: boolean;
  editDraft: string;
  gapFlagged?: boolean;
  gapNote?: string;
  onSelect: (id: string) => void;
  onDoubleClick: (id: string, currentLabel: string) => void;
  onEditChange: (value: string) => void;
  onEditCommit: () => void;
  onEditCancel: () => void;
}

const TaskNode = React.memo(function TaskNode({
  node,
  label,
  selected,
  editing,
  editDraft,
  gapFlagged,
  gapNote,
  onSelect,
  onDoubleClick,
  onEditChange,
  onEditCommit,
  onEditCancel,
}: TaskNodeProps) {
  // Gap flag from workshop overrides status stripe
  const stripeColor = gapFlagged
    ? STATUS_STRIPE.gap
    : node.raw.status
      ? (STATUS_STRIPE[node.raw.status] ?? undefined)
      : undefined;
  const hasOverlays = node.overlays.length > 0;

  // Click debounce: prevent single-click handler firing on a double-click
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editing) return;
    clickTimer.current = setTimeout(() => onSelect(node.id), 180);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (clickTimer.current) clearTimeout(clickTimer.current);
    onDoubleClick(node.id, label);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onEditCommit();
    }
    if (e.key === "Escape") onEditCancel();
  };

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      style={{
        position: "absolute",
        left: node.x,
        top: node.y,
        width: node.w,
        height: node.h,
        backgroundColor: "#1E293B",
        borderStyle: gapFlagged ? "dashed" : "solid",
        borderWidth: stripeColor
          ? `${selected ? 1.5 : 1}px ${selected ? 1.5 : 1}px ${selected ? 1.5 : 1}px 3px`
          : selected ? "1.5px" : "1px",
        borderColor: stripeColor
          ? `rgba(71,85,105,0.7) rgba(71,85,105,0.7) rgba(71,85,105,0.7) ${stripeColor}`
          : selected
            ? "rgba(59,130,246,0.7)"
            : "rgba(71,85,105,0.7)",
        borderRadius: 8,
        padding: "10px 12px",
        cursor: editing ? "default" : "pointer",
        boxShadow: selected
          ? "0 0 0 3px rgba(59,130,246,0.2)"
          : "0 1px 3px rgba(0,0,0,0.3)",
        transition: "border-color 0.12s ease, box-shadow 0.12s ease",
        userSelect: "none",
        overflow: "visible", // allow overlay badge to bleed out
      }}
    >
      {/* Overlay count badge */}
      {hasOverlays && !editing && (
        <div
          style={{
            position: "absolute",
            top: -6,
            right: -6,
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: "#F59E0B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontSize: 8,
              fontWeight: 700,
              color: "#000",
              lineHeight: 1,
            }}
          >
            {node.overlays.length}
          </span>
        </div>
      )}

      {/* Label or edit textarea */}
      {editing ? (
        <textarea
          autoFocus
          value={editDraft}
          onChange={(e) => onEditChange(e.target.value)}
          onBlur={onEditCommit}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            height: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            fontSize: 11,
            fontWeight: 500,
            fontFamily: "'DM Sans', system-ui, sans-serif",
            color: "#F1F5F9",
            lineHeight: 1.4,
            padding: 0,
            cursor: "text",
          }}
        />
      ) : (
        <p
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 500,
            fontFamily: "'DM Sans', system-ui, sans-serif",
            color: "#F1F5F9",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {label}
        </p>
      )}

      {/* System badge */}
      {node.raw.system && !editing && (
        <div
          style={{
            position: "absolute",
            bottom: 5,
            right: 8,
          }}
        >
          <span
            style={{
              fontSize: 8,
              fontFamily: "'JetBrains Mono', monospace",
              color: "#64748B",
              backgroundColor: "#334155",
              borderRadius: 3,
              padding: "1px 5px",
            }}
          >
            {node.raw.system}
          </span>
        </div>
      )}

      {/* Gap notes indicator */}
      {gapFlagged && gapNote && !editing && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: node.h + 4,
            width: node.w,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 4,
              padding: "3px 6px",
              backgroundColor: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 5,
            }}
          >
            <span
              style={{
                fontSize: 8,
                fontFamily: "'JetBrains Mono', monospace",
                color: "#EF4444",
                fontWeight: 600,
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              GAP
            </span>
            <span
              style={{
                fontSize: 9,
                fontFamily: "'DM Sans', system-ui, sans-serif",
                color: "#94A3B8",
                lineHeight: 1.3,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical" as const,
                overflow: "hidden",
              }}
            >
              {gapNote}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

// ── Gateway node (diamond) ────────────────────────────────────────────────────

const GatewayNode = React.memo(function GatewayNode({
  node,
  selected,
  onSelect,
}: {
  node: NodeLayout;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      style={{
        position: "absolute",
        left: node.x,
        top: node.y,
        width: node.w,
        height: node.h,
        cursor: "pointer",
      }}
    >
      {/* Rotated square = diamond */}
      <div
        style={{
          position: "absolute",
          width: GW,
          height: GW,
          top: 4,
          left: 4,
          transform: "rotate(45deg)",
          backgroundColor: "#334155",
          border: selected
            ? "1.5px solid rgba(59,130,246,0.7)"
            : "1px solid rgba(71,85,105,0.6)",
          boxShadow: selected ? "0 0 0 3px rgba(59,130,246,0.15)" : undefined,
          transition: "border-color 0.12s ease",
        }}
      />
      {/* Label (un-rotated, centered) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            fontSize: 8,
            fontFamily: "'DM Sans', system-ui, sans-serif",
            color: "#94A3B8",
            textAlign: "center",
            maxWidth: 46,
            lineHeight: 1.2,
          }}
        >
          {node.raw.label}
        </span>
      </div>
    </div>
  );
});

// ── Start / End node (circle) ─────────────────────────────────────────────────

const StartEndNode = React.memo(function StartEndNode({
  node,
}: {
  node: NodeLayout;
}) {
  const isStart = node.raw.type === "start";
  return (
    <div
      style={{
        position: "absolute",
        left: node.x,
        top: node.y,
        width: SE,
        height: SE,
        borderRadius: "50%",
        border: isStart
          ? "2px solid #3B82F6"
          : "2px solid #10B981",
        backgroundColor: isStart
          ? "rgba(59,130,246,0.15)"
          : "rgba(16,185,129,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      {!isStart && (
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: "#10B981",
          }}
        />
      )}
    </div>
  );
});

// ── Node layer ────────────────────────────────────────────────────────────────

export const FlowNodeLayer = React.memo(function FlowNodeLayer({
  nodes,
  swimlanes,
  selectedId,
  editingId,
  editDraft,
  labels,
  gapNodeIds,
  gapNotes,
  onSelect,
  onDeselect,
  onDoubleClick,
  onEditChange,
  onEditCommit,
  onEditCancel,
}: LayerProps) {
  return (
    // onClick on this container handles background-click deselection.
    // Node components call e.stopPropagation() so their clicks don't bubble here.
    <div
      style={{ position: "absolute", inset: 0 }}
      onClick={onDeselect}
    >
      {/* Swimlane bands — pointer-events:none (in SwimlaneBand) */}
      {swimlanes.map((lane, i) => (
        <SwimlaneBand
          key={lane.label}
          lane={lane}
          isLast={i === swimlanes.length - 1}
        />
      ))}

      {/* Nodes */}
      {nodes.map((node) => {
        if (node.renderKind === "task") {
          const label = labels[node.id] ?? node.raw.label;
          return (
            <TaskNode
              key={node.id}
              node={node}
              label={label}
              selected={selectedId === node.id}
              editing={editingId === node.id}
              editDraft={editDraft}
              gapFlagged={gapNodeIds?.has(node.id)}
              gapNote={gapNotes?.get(node.id)}
              onSelect={onSelect}
              onDoubleClick={onDoubleClick}
              onEditChange={onEditChange}
              onEditCommit={onEditCommit}
              onEditCancel={onEditCancel}
            />
          );
        }

        if (node.renderKind === "gateway") {
          return (
            <GatewayNode
              key={node.id}
              node={node}
              selected={selectedId === node.id}
              onSelect={onSelect}
            />
          );
        }

        // startEnd
        return <StartEndNode key={node.id} node={node} />;
      })}
    </div>
  );
});
