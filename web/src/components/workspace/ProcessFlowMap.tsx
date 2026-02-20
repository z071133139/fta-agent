"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  NodeToolbar,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Dagre from "@dagrejs/dagre";
import type {
  ProcessFlowData,
  ProcessFlowNode,
  ProcessOverlay,
  ProcessOverlayKind,
} from "@/lib/mock-data";

// ── Layout constants ──────────────────────────────────────────────────────

const LANE_HEIGHT = 130;
const LABEL_COL_W = 128;
const TASK_W = 160;
const TASK_H = 68;
const GW_SIZE = 44;
const SE_SIZE = 32;
const RANKSEP = 90;
const NODESEP = 50;
const CANVAS_PADDING = 60;

// ── Overlay kind config ───────────────────────────────────────────────────

const OVERLAY_CONFIG: Record<
  ProcessOverlayKind,
  { label: string; badgeClass: string; dotColor: string }
> = {
  constraint: { label: "Constraint", badgeClass: "bg-[#F59E0B]/15 text-[#F59E0B]", dotColor: "#F59E0B" },
  requirement: { label: "Requirement", badgeClass: "bg-[#3B82F6]/15 text-[#3B82F6]", dotColor: "#3B82F6" },
  exception: { label: "Exception", badgeClass: "bg-[#A855F7]/15 text-[#A855F7]", dotColor: "#A855F7" },
  risk: { label: "Risk", badgeClass: "bg-[#EF4444]/15 text-[#EF4444]", dotColor: "#EF4444" },
};

// ── Node status stripe ────────────────────────────────────────────────────

const STATUS_STRIPE: Record<string, string> = {
  leading_practice: "border-l-2 border-l-[#3B82F6]",
  client_overlay: "border-l-2 border-l-[#F59E0B]",
  gap: "border-l-2 border-l-[#EF4444]",
};

// ── Swimlane group node ───────────────────────────────────────────────────

function SwimlaneGroupNode({ data: rawData }: NodeProps) {
  const data = rawData as unknown as { label: string };
  return (
    <div className="w-full h-full border-y border-border/30 relative bg-surface/10">
      <div
        className="absolute left-0 top-0 bottom-0 flex items-center justify-center border-r border-border/30"
        style={{ width: LABEL_COL_W }}
      >
        <span
          className="text-[9px] uppercase tracking-[0.18em] text-muted/60 font-medium"
          style={{ writingMode: "vertical-lr", transform: "rotate(180deg)" }}
        >
          {data.label}
        </span>
      </div>
    </div>
  );
}

// ── Task node ─────────────────────────────────────────────────────────────

type TaskRFNodeData = ProcessFlowNode & {
  overlayCount: number;
  overlays: ProcessOverlay[];
};

function TaskNode({ data: rawData, selected }: NodeProps) {
  const data = rawData as unknown as TaskRFNodeData;
  const stripeClass = data.status ? STATUS_STRIPE[data.status] ?? "" : "";
  const hasOverlays = data.overlayCount > 0;

  return (
    <>
      <NodeToolbar isVisible={selected && hasOverlays} position={Position.Bottom} offset={8}>
        <div className="bg-surface border border-border rounded-lg shadow-xl p-3 max-w-[280px] space-y-2.5">
          {data.overlays.map((ov) => {
            const cfg = OVERLAY_CONFIG[ov.kind];
            return (
              <div key={ov.id} className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[8px] uppercase tracking-[0.1em] font-medium px-1.5 py-0.5 rounded ${cfg.badgeClass}`}
                  >
                    {cfg.label}
                  </span>
                  {ov.source === "gl_finding" && (
                    <span className="text-[8px] bg-[#10B981]/10 text-[#10B981] px-1.5 py-0.5 rounded">
                      ↗ GL Analysis
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted leading-relaxed">{ov.text}</p>
              </div>
            );
          })}
        </div>
      </NodeToolbar>

      <div
        className={[
          "relative bg-surface border border-border/70 rounded-lg px-3 py-2.5 cursor-pointer transition-colors",
          stripeClass,
          selected ? "border-accent/60 ring-1 ring-accent/30" : "",
        ].join(" ")}
        style={{ minWidth: TASK_W, maxWidth: 200, height: TASK_H }}
      >
        <Handle type="target" position={Position.Left} id="tl" />
        <Handle type="source" position={Position.Right} id="sr" />

        {/* Overlay badge */}
        {hasOverlays && (
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#F59E0B] flex items-center justify-center">
            <span className="text-[8px] font-bold text-black leading-none">
              {data.overlayCount}
            </span>
          </div>
        )}

        <p className="text-[11px] font-medium text-foreground leading-snug line-clamp-2">
          {data.label}
        </p>

        {data.system && (
          <div className="absolute bottom-1.5 right-2">
            <span className="text-[8px] bg-surface-alt text-muted rounded px-1.5 py-0.5">
              {data.system}
            </span>
          </div>
        )}
      </div>
    </>
  );
}

// ── Gateway node ──────────────────────────────────────────────────────────

function GatewayNode({ data: rawData, selected }: NodeProps) {
  const data = rawData as unknown as ProcessFlowNode;
  return (
    <div className="relative" style={{ width: GW_SIZE + 8, height: GW_SIZE + 8 }}>
      <Handle type="target" position={Position.Left} id="tl" />
      <Handle type="source" position={Position.Right} id="sr" />
      <Handle type="source" position={Position.Bottom} id="sb" />

      <div
        className={[
          "bg-surface-alt border border-border rotate-45 transition-colors",
          selected ? "border-accent/60" : "",
        ].join(" ")}
        style={{
          width: GW_SIZE,
          height: GW_SIZE,
          margin: 4,
        }}
      />
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ paddingTop: 4 }}
      >
        <span className="text-[8px] text-muted text-center leading-tight max-w-[50px]">
          {data.label}
        </span>
      </div>
    </div>
  );
}

// ── Start / End node ──────────────────────────────────────────────────────

function StartEndNode({ data: rawData }: NodeProps) {
  const data = rawData as unknown as ProcessFlowNode;
  const isStart = data.type === "start";
  return (
    <div className="relative">
      <Handle
        type={isStart ? "source" : "target"}
        position={isStart ? Position.Right : Position.Left}
        id={isStart ? "sr" : "tl"}
      />
      <div
        className={[
          "rounded-full border-2 flex items-center justify-center",
          isStart
            ? "bg-[#3B82F6]/20 border-[#3B82F6]"
            : "bg-[#10B981]/20 border-[#10B981]",
        ].join(" ")}
        style={{ width: SE_SIZE, height: SE_SIZE }}
      >
        {!isStart && (
          <div className="w-3 h-3 rounded-full bg-[#10B981]" />
        )}
      </div>
    </div>
  );
}

// ── Node types registry ───────────────────────────────────────────────────

const nodeTypes = {
  swimlane: SwimlaneGroupNode,
  task: TaskNode,
  gateway: GatewayNode,
  startEnd: StartEndNode,
} as const;

// ── Layout builder ────────────────────────────────────────────────────────

function nodeSize(type: string): { w: number; h: number } {
  if (type === "gateway_exclusive" || type === "gateway_parallel") {
    return { w: GW_SIZE + 8, h: GW_SIZE + 8 };
  }
  if (type === "start" || type === "end") {
    return { w: SE_SIZE, h: SE_SIZE };
  }
  return { w: TASK_W, h: TASK_H };
}

function buildFlowLayout(data: ProcessFlowData): {
  nodes: Node[];
  edges: Edge[];
} {
  const swimlanes = data.swimlanes ?? [];
  const numLanes = swimlanes.length;
  const totalHeight = numLanes * LANE_HEIGHT;

  // Run dagre for x-ordering (LR)
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", ranksep: RANKSEP, nodesep: NODESEP });

  for (const node of data.nodes) {
    const { w, h } = nodeSize(node.type);
    g.setNode(node.id, { width: w, height: h });
  }
  for (const edge of data.edges) {
    g.setEdge(edge.source, edge.target);
  }
  Dagre.layout(g);

  // Canvas width from dagre
  let maxX = 0;
  for (const node of data.nodes) {
    const pos = g.node(node.id);
    const { w } = nodeSize(node.type);
    maxX = Math.max(maxX, pos.x + w / 2);
  }
  const canvasW = LABEL_COL_W + maxX + CANVAS_PADDING;

  // Overlay map
  const overlayMap = new Map<string, ProcessOverlay[]>();
  for (const ov of (data.overlays ?? [])) {
    if (!overlayMap.has(ov.node_id)) overlayMap.set(ov.node_id, []);
    overlayMap.get(ov.node_id)!.push(ov);
  }

  const rfNodes: Node[] = [];
  const rfEdges: Edge[] = [];

  // Swimlane background nodes
  swimlanes.forEach((lane, i) => {
    rfNodes.push({
      id: `lane-${i}`,
      type: "swimlane",
      position: { x: 0, y: i * LANE_HEIGHT },
      style: { width: canvasW, height: LANE_HEIGHT, zIndex: -1 },
      data: { label: lane },
      selectable: false,
      draggable: false,
      focusable: false,
      zIndex: -1,
    });
  });

  // Content nodes
  for (const node of data.nodes) {
    const dagreNode = g.node(node.id);
    const { w, h } = nodeSize(node.type);
    const laneIndex = swimlanes.indexOf(node.role ?? "");
    const laneY = laneIndex >= 0 ? laneIndex * LANE_HEIGHT : 0;

    const absX = LABEL_COL_W + dagreNode.x - w / 2;
    const absY = laneY + (LANE_HEIGHT - h) / 2;

    const overlays = overlayMap.get(node.id) ?? [];

    if (node.type === "task" || node.type === "subprocess") {
      rfNodes.push({
        id: node.id,
        type: "task",
        position: { x: absX, y: absY },
        data: { ...node, overlayCount: overlays.length, overlays } as Record<string, unknown>,
        selectable: true,
        draggable: false,
      });
    } else if (
      node.type === "gateway_exclusive" ||
      node.type === "gateway_parallel"
    ) {
      rfNodes.push({
        id: node.id,
        type: "gateway",
        position: { x: absX, y: absY },
        data: node as unknown as Record<string, unknown>,
        selectable: true,
        draggable: false,
      });
    } else if (node.type === "start" || node.type === "end") {
      rfNodes.push({
        id: node.id,
        type: "startEnd",
        position: { x: absX, y: absY },
        data: node as unknown as Record<string, unknown>,
        selectable: false,
        draggable: false,
      });
    }
  }

  // Edges
  for (const edge of data.edges) {
    rfEdges.push({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: "sr",
      targetHandle: "tl",
      label: edge.label,
      type: "smoothstep",
      animated: true,
      style: { stroke: "#475569", strokeWidth: 1.5 },
      labelStyle: { fontSize: 9, fill: "#94A3B8" },
      labelBgStyle: { fill: "#1E293B", fillOpacity: 0.9 },
      labelBgPadding: [3, 5] as [number, number],
      labelBgBorderRadius: 3,
    });
  }

  return { nodes: rfNodes, edges: rfEdges };
}

// ── Main component ────────────────────────────────────────────────────────

export function ProcessFlowMap({ data }: { data: ProcessFlowData }) {
  const { nodes, edges } = buildFlowLayout(data);

  const onPaneClick = useCallback(() => {
    // pane click deselects (React Flow handles it)
  }, []);

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-3 left-3 z-10">
        <span className="text-[9px] font-mono text-muted bg-surface/80 border border-border/40 rounded px-2 py-1">
          {data.name}
        </span>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onPaneClick={onPaneClick}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        fitView={true}
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#334155" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
