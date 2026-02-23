import { useMemo } from "react";
import Dagre from "@dagrejs/dagre";
import type {
  ProcessFlowData,
  ProcessFlowNode,
  ProcessFlowEdge,
  ProcessOverlay,
} from "@/lib/mock-data";

// ── Constants ──────────────────────────────────────────────────────────────────

export const LANE_H = 130;
export const LABEL_COL_W = 120;
export const TASK_W = 160;
export const TASK_H = 68;
export const GW = 44; // gateway diamond size
export const SE = 32; // start/end circle diameter
const RANKSEP = 90;
const NODESEP = 50;
const CANVAS_PAD = 60;

// ── Types ──────────────────────────────────────────────────────────────────────

export type NodeRenderKind = "task" | "gateway" | "startEnd";

export interface NodeLayout {
  id: string;
  renderKind: NodeRenderKind;
  x: number; // top-left in canvas coords
  y: number;
  w: number;
  h: number;
  raw: ProcessFlowNode;
  overlays: ProcessOverlay[];
}

export interface EdgeLayout {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
  path: string; // SVG cubic bezier path string
  labelX: number; // bezier midpoint for label placement
  labelY: number;
}

export interface SwimlaneLayout {
  label: string;
  y: number;
  h: number;
  w: number; // full canvas width
}

export interface FlowLayout {
  nodes: NodeLayout[];
  nodeMap: Map<string, NodeLayout>;
  edges: EdgeLayout[];
  swimlanes: SwimlaneLayout[];
  canvasW: number;
  canvasH: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function nodeDims(type: string): [number, number] {
  if (type === "gateway_exclusive" || type === "gateway_parallel")
    return [GW + 8, GW + 8];
  if (type === "start" || type === "end") return [SE, SE];
  return [TASK_W, TASK_H];
}

function nodeRenderKind(type: string): NodeRenderKind {
  if (type === "gateway_exclusive" || type === "gateway_parallel")
    return "gateway";
  if (type === "start" || type === "end") return "startEnd";
  return "task";
}

function buildEdgePath(
  src: NodeLayout,
  tgt: NodeLayout
): { path: string; labelX: number; labelY: number } {
  const srcCenterY = src.y + src.h / 2;
  const tgtCenterY = tgt.y + tgt.h / 2;

  // Gateway bottom port when target is significantly lower (cross-lane)
  const useBottom =
    src.renderKind === "gateway" &&
    tgtCenterY > srcCenterY + LANE_H * 0.3;

  const sx = useBottom ? src.x + src.w / 2 : src.x + src.w;
  const sy = useBottom ? src.y + src.h : src.y + src.h / 2;
  const tx = tgt.x;
  const ty = tgt.y + tgt.h / 2;

  const dist = Math.hypot(tx - sx, ty - sy);
  const off = Math.max(dist * 0.45, 50);

  let cp1x: number, cp1y: number, cp2x: number, cp2y: number;
  if (useBottom) {
    cp1x = sx;
    cp1y = sy + off * 0.7;
    cp2x = tx - off * 0.6;
    cp2y = ty;
  } else {
    cp1x = sx + off;
    cp1y = sy;
    cp2x = tx - off;
    cp2y = ty;
  }

  const path = `M ${sx} ${sy} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${tx} ${ty}`;

  // Bezier midpoint at t=0.5 via de Casteljau
  const labelX =
    0.125 * sx + 0.375 * cp1x + 0.375 * cp2x + 0.125 * tx;
  const labelY =
    0.125 * sy + 0.375 * cp1y + 0.375 * cp2y + 0.125 * ty;

  return { path, labelX, labelY };
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export interface FlowLayoutOptions {
  extraNodes?: ProcessFlowNode[];
  extraEdges?: ProcessFlowEdge[];
  /** Edges to remove (by edge id) when inserting nodes mid-flow */
  removeEdgeIds?: Set<string>;
  /** Nodes to remove (by node id) when deleting steps */
  removeNodeIds?: Set<string>;
}

export function useFlowLayout(
  data: ProcessFlowData,
  options?: FlowLayoutOptions
): FlowLayout {
  const extraNodes = options?.extraNodes;
  const extraEdges = options?.extraEdges;
  const removeEdgeIds = options?.removeEdgeIds;
  const removeNodeIds = options?.removeNodeIds;

  return useMemo(() => {
    const laneLabels = data.swimlanes ?? [];

    // Merge nodes: base (minus deleted) + extras
    let baseNodes = data.nodes;
    if (removeNodeIds && removeNodeIds.size > 0) {
      baseNodes = baseNodes.filter((n) => !removeNodeIds.has(n.id));
    }
    const allNodes = extraNodes
      ? [...baseNodes, ...extraNodes]
      : baseNodes;

    // Merge edges: base (minus removed) + extras
    let allEdges = data.edges;
    if (removeEdgeIds && removeEdgeIds.size > 0) {
      allEdges = allEdges.filter((e) => !removeEdgeIds.has(e.id));
    }
    if (extraEdges) {
      allEdges = [...allEdges, ...extraEdges];
    }

    const canvasH = Math.max(laneLabels.length, 1) * LANE_H;

    // Dagre: LR layout to determine x-axis ordering
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: "LR", ranksep: RANKSEP, nodesep: NODESEP });

    for (const n of allNodes) {
      const [w, h] = nodeDims(n.type);
      g.setNode(n.id, { width: w, height: h });
    }
    for (const e of allEdges) {
      g.setEdge(e.source, e.target);
    }
    Dagre.layout(g);

    // Derive canvas width from Dagre output
    let maxX = 0;
    for (const n of allNodes) {
      const p = g.node(n.id);
      const [w] = nodeDims(n.type);
      maxX = Math.max(maxX, p.x + w / 2);
    }
    const canvasW = LABEL_COL_W + maxX + CANVAS_PAD;

    // Overlay lookup
    const ovMap = new Map<string, ProcessOverlay[]>();
    for (const ov of data.overlays ?? []) {
      if (!ovMap.has(ov.node_id)) ovMap.set(ov.node_id, []);
      ovMap.get(ov.node_id)!.push(ov);
    }

    // Build NodeLayout for each node
    // NOTE: Y position is swimlane-pinned (not Dagre's Y).
    // Dagre Y is discarded; only Dagre X is used for left→right ordering.
    const nodeMap = new Map<string, NodeLayout>();
    for (const n of allNodes) {
      const dp = g.node(n.id);
      const [w, h] = nodeDims(n.type);
      const laneIdx = laneLabels.indexOf(n.role ?? "");
      const laneY = laneIdx >= 0 ? laneIdx * LANE_H : 0;
      const x = LABEL_COL_W + dp.x - w / 2;
      const y = laneY + (LANE_H - h) / 2;

      nodeMap.set(n.id, {
        id: n.id,
        renderKind: nodeRenderKind(n.type),
        x,
        y,
        w,
        h,
        raw: n,
        overlays: ovMap.get(n.id) ?? [],
      });
    }

    // Build EdgeLayout
    const edges: EdgeLayout[] = [];
    for (const e of allEdges) {
      const src = nodeMap.get(e.source);
      const tgt = nodeMap.get(e.target);
      if (!src || !tgt) continue;
      const { path, labelX, labelY } = buildEdgePath(src, tgt);
      edges.push({
        id: e.id,
        sourceId: e.source,
        targetId: e.target,
        label: e.label ?? undefined,
        path,
        labelX,
        labelY,
      });
    }

    // Swimlane bands
    const swimlanes: SwimlaneLayout[] = laneLabels.map((label, i) => ({
      label,
      y: i * LANE_H,
      h: LANE_H,
      w: canvasW,
    }));

    return {
      nodes: [...nodeMap.values()],
      nodeMap,
      edges,
      swimlanes,
      canvasW,
      canvasH,
    };
  }, [data, extraNodes, extraEdges, removeEdgeIds, removeNodeIds]);
}
