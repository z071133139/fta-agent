"use client";

import React from "react";
import type { FlowLayout } from "./useFlowLayout";

interface Props {
  layout: FlowLayout;
  selectedId: string | null;
}

// Arrowhead marker IDs
const ARROW_DEFAULT = "flow-arrow-default";
const ARROW_SELECTED = "flow-arrow-selected";

export const FlowEdgeLayer = React.memo(function FlowEdgeLayer({
  layout,
  selectedId,
}: Props) {
  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: layout.canvasW,
        height: layout.canvasH,
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      <defs>
        {/* Default arrowhead — tip at refX=10 aligns exactly with path endpoint */}
        <marker
          id={ARROW_DEFAULT}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
        </marker>
        <marker
          id={ARROW_SELECTED}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#3B82F6" />
        </marker>
      </defs>

      {layout.edges.map((edge) => {
        const isRelated =
          selectedId !== null &&
          (edge.sourceId === selectedId || edge.targetId === selectedId);
        const stroke = isRelated ? "#3B82F6" : "#475569";
        const marker = isRelated
          ? `url(#${ARROW_SELECTED})`
          : `url(#${ARROW_DEFAULT})`;

        return (
          <g key={edge.id}>
            {/* Animated flowing edge */}
            <path
              d={edge.path}
              stroke={stroke}
              strokeWidth={isRelated ? 2 : 1.5}
              fill="none"
              markerEnd={marker}
              className="edge-animated"
              style={{
                transition: "stroke 0.15s ease, stroke-width 0.15s ease",
              }}
            />

            {/* Condition label (Yes / No on gateway branches) */}
            {edge.label && (
              <g>
                <rect
                  x={edge.labelX - 14}
                  y={edge.labelY - 7}
                  width={28}
                  height={14}
                  rx={3}
                  fill="#1E293B"
                  fillOpacity={0.9}
                />
                <text
                  x={edge.labelX}
                  y={edge.labelY + 4}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#94A3B8"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  {edge.label}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
});
