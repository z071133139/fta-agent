"use client";

import { useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AnimatePresence, motion } from "framer-motion";
import type { ProcessInventoryData, ProcessInventoryNode, ProcessScopeStatus } from "@/lib/mock-data";

// ── Layout constants ──────────────────────────────────────────────────────

const CARD_W = 220;
const CARD_H = 80;
const V_GAP = 16;
const H_PAD = 24;
const V_PAD = 24;
const LABEL_H = 28;
const GROUP_W = CARD_W + H_PAD * 2;
const COL_GAP = 80;

// ── Scope status visual config ────────────────────────────────────────────

const SCOPE_CONFIG: Record<
  ProcessScopeStatus,
  { borderClass: string; dotClass: string; textClass: string; dotPulse?: boolean }
> = {
  complete: {
    borderClass: "border-l-[3px] border-l-[#10B981]",
    dotClass: "bg-[#10B981]",
    textClass: "text-foreground",
  },
  in_progress: {
    borderClass: "border-l-[3px] border-l-[#3B82F6]",
    dotClass: "bg-[#3B82F6] agent-thinking",
    textClass: "text-foreground",
    dotPulse: true,
  },
  in_scope: {
    borderClass: "border-l-[3px] border-l-[#475569]",
    dotClass: "bg-[#475569]",
    textClass: "text-foreground",
  },
  deferred: {
    borderClass: "border-l-[3px] border-l-[#475569] opacity-50",
    dotClass: "bg-[#475569]",
    textClass: "text-muted line-through",
  },
  out_of_scope: {
    borderClass: "border-l-[3px] border-l-[#475569] opacity-40",
    dotClass: "bg-[#475569]",
    textClass: "text-muted line-through",
  },
};

// ── Custom node: ProcessCardNode ──────────────────────────────────────────

function ProcessCardNode({ data: rawData, selected }: NodeProps) {
  const data = rawData as unknown as ProcessInventoryNode;
  const cfg = SCOPE_CONFIG[data.scope_status];
  return (
    <div
      className={[
        "relative bg-surface rounded-lg border border-border/60 overflow-hidden cursor-pointer transition-colors",
        cfg.borderClass,
        selected ? "border-accent/60 ring-1 ring-accent/30" : "",
      ].join(" ")}
      style={{ width: CARD_W, height: CARD_H }}
    >
      {/* Invisible handles */}
      <Handle type="target" position={Position.Top} id="tgt-top" />
      <Handle type="target" position={Position.Bottom} id="tgt-bottom" />
      <Handle type="target" position={Position.Left} id="tgt-left" />
      <Handle type="target" position={Position.Right} id="tgt-right" />
      <Handle type="source" position={Position.Top} id="src-top" />
      <Handle type="source" position={Position.Bottom} id="src-bottom" />
      <Handle type="source" position={Position.Left} id="src-left" />
      <Handle type="source" position={Position.Right} id="src-right" />

      <div className="flex items-start gap-2 px-3 py-2.5 h-full">
        {/* Scope dot */}
        <div className="mt-1 flex-shrink-0">
          <div className={`w-2 h-2 rounded-full ${cfg.dotClass}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-[11px] font-medium leading-snug truncate ${cfg.textClass}`}>
            {data.name}
          </p>
          {data.owner_agent && (
            <p className="mt-0.5 text-[9px] text-muted truncate">{data.owner_agent}</p>
          )}
        </div>

        {/* Sub-flow count */}
        <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
          <span className="text-[11px] font-mono text-muted">{data.sub_flow_count}</span>
          <span className="text-[8px] text-muted/60 uppercase tracking-wide">flows</span>
        </div>
      </div>
    </div>
  );
}

// ── Group label node ──────────────────────────────────────────────────────

function GroupLabelNode({ data: rawData }: NodeProps) {
  const data = rawData as unknown as { label: string };
  return (
    <div className="text-[10px] uppercase tracking-[0.12em] font-medium text-muted/70 px-1">
      {data.label}
    </div>
  );
}

// ── Node types registry ───────────────────────────────────────────────────

const nodeTypes = {
  processCard: ProcessCardNode,
  groupLabel: GroupLabelNode,
} as const;

// ── Layout builder ────────────────────────────────────────────────────────

const edgeStyle = {
  style: { stroke: "#475569", strokeWidth: 1.5 },
  labelStyle: { fontSize: 9, fill: "#94A3B8" },
  labelBgStyle: { fill: "#1E293B", fillOpacity: 0.9 },
  labelBgPadding: [3, 5] as [number, number],
  labelBgBorderRadius: 3,
};

function buildInventoryLayout(data: ProcessInventoryData): {
  nodes: Node[];
  edges: Edge[];
} {
  // Group by process_area preserving insertion order
  const areaMap = new Map<string, ProcessInventoryNode[]>();
  for (const node of data.nodes) {
    const area = node.process_area ?? "Other";
    if (!areaMap.has(area)) areaMap.set(area, []);
    areaMap.get(area)!.push(node);
  }

  const rfNodes: Node[] = [];
  const rfEdges: Edge[] = [];

  let xCursor = 0;

  for (const [area, nodes] of areaMap) {
    const groupH =
      LABEL_H + V_PAD + nodes.length * (CARD_H + V_GAP) - V_GAP + V_PAD;
    const groupId = `group-${area.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`;

    // Group background (React Flow built-in group node)
    rfNodes.push({
      id: groupId,
      type: "group",
      position: { x: xCursor, y: 0 },
      style: { width: GROUP_W, height: groupH },
      data: { label: area },
      selectable: false,
      draggable: false,
    });

    // Label node inside group
    rfNodes.push({
      id: `${groupId}-label`,
      type: "groupLabel",
      parentId: groupId,
      position: { x: H_PAD, y: 8 },
      data: { label: area },
      selectable: false,
      draggable: false,
      extent: "parent",
    });

    nodes.forEach((node, i) => {
      rfNodes.push({
        id: node.id,
        type: "processCard",
        position: {
          x: xCursor + H_PAD,
          y: LABEL_H + V_PAD + i * (CARD_H + V_GAP),
        },
        data: node as unknown as Record<string, unknown>,
        selectable: true,
        draggable: false,
        style: { width: CARD_W },
      });
    });

    xCursor += GROUP_W + COL_GAP;
  }

  // Build a position lookup for edge handle selection
  const nodePositions = new Map<string, { x: number; y: number }>();
  rfNodes.forEach((n) => {
    if (n.type === "processCard") {
      nodePositions.set(n.id, n.position);
    }
  });

  for (const edge of data.edges) {
    const srcPos = nodePositions.get(edge.source);
    const tgtPos = nodePositions.get(edge.target);

    let sourceHandle = "src-right";
    let targetHandle = "tgt-left";

    if (srcPos && tgtPos) {
      const sameColumn = Math.abs(srcPos.x - tgtPos.x) < 10;
      if (sameColumn) {
        // Vertical same-column edge: use top/bottom
        if (srcPos.y > tgtPos.y) {
          sourceHandle = "src-top";
          targetHandle = "tgt-bottom";
        } else {
          sourceHandle = "src-bottom";
          targetHandle = "tgt-top";
        }
      } else if (srcPos.x > tgtPos.x) {
        // Right-to-left cross-column edge
        sourceHandle = "src-left";
        targetHandle = "tgt-right";
      }
      // else: left-to-right, use defaults (src-right, tgt-left)
    }

    rfEdges.push({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle,
      targetHandle,
      label: edge.label,
      type: "smoothstep",
      ...edgeStyle,
    });
  }

  return { nodes: rfNodes, edges: rfEdges };
}

// ── Detail drawer ─────────────────────────────────────────────────────────

const SCOPE_LABEL: Record<ProcessScopeStatus, string> = {
  complete: "Complete",
  in_progress: "In Progress",
  in_scope: "In Scope",
  deferred: "Deferred",
  out_of_scope: "Out of Scope",
};

const SCOPE_BADGE: Record<ProcessScopeStatus, string> = {
  complete: "bg-[#10B981]/15 text-[#10B981]",
  in_progress: "bg-[#3B82F6]/15 text-[#3B82F6]",
  in_scope: "bg-surface-alt text-muted",
  deferred: "bg-surface-alt text-muted/60",
  out_of_scope: "bg-surface-alt text-muted/40",
};

function DetailDrawer({
  node,
  onClose,
}: {
  node: ProcessInventoryNode;
  onClose: () => void;
}) {
  return (
    <motion.div
      key="drawer"
      className="absolute top-0 right-0 bottom-0 w-[280px] bg-surface border-l border-border flex flex-col overflow-hidden z-10"
      initial={{ x: 280 }}
      animate={{ x: 0 }}
      exit={{ x: 280 }}
      transition={{ type: "spring", damping: 28, stiffness: 260 }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
        <span className="text-[10px] uppercase tracking-[0.12em] text-muted">
          Process Detail
        </span>
        <button
          onClick={onClose}
          className="text-muted hover:text-foreground transition-colors text-[18px] leading-none"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div>
          <p className="text-[13px] font-medium text-foreground leading-snug">
            {node.name}
          </p>
          {node.process_area && (
            <p className="mt-1 text-[10px] text-muted">{node.process_area}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-[9px] uppercase tracking-[0.1em] font-medium px-2 py-0.5 rounded ${SCOPE_BADGE[node.scope_status]}`}
          >
            {SCOPE_LABEL[node.scope_status]}
          </span>
          <span className="text-[10px] text-muted font-mono">
            {node.sub_flow_count} sub-flow{node.sub_flow_count !== 1 ? "s" : ""}
          </span>
        </div>

        {node.description && (
          <div>
            <p className="text-[9px] uppercase tracking-[0.1em] text-muted/60 mb-1.5">
              Description
            </p>
            <p className="text-[11px] text-muted leading-relaxed">{node.description}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export function ProcessInventoryGraph({ data }: { data: ProcessInventoryData }) {
  const { nodes, edges } = buildInventoryLayout(data);
  const [selectedNode, setSelectedNode] = useState<ProcessInventoryNode | null>(null);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.type === "processCard") {
        const nodeData = node.data as unknown as ProcessInventoryNode;
        setSelectedNode((prev) =>
          prev?.id === nodeData.id ? null : nodeData
        );
      } else {
        setSelectedNode(null);
      }
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const miniMapNodeColor = (node: Node) => {
    if (node.type === "processCard") {
      const cfg = SCOPE_CONFIG[(node.data as unknown as ProcessInventoryNode).scope_status];
      if (cfg.dotClass.includes("10B981")) return "#10B981";
      if (cfg.dotClass.includes("3B82F6")) return "#3B82F6";
      return "#475569";
    }
    return "#1E293B";
  };

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        fitView={true}
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#334155" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={miniMapNodeColor}
          maskColor="rgba(15,23,42,0.8)"
          style={{ bottom: 16, right: 16 }}
        />
      </ReactFlow>

      <AnimatePresence>
        {selectedNode && (
          <DetailDrawer
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
