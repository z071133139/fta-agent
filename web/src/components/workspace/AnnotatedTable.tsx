"use client";

import { useState, Fragment } from "react";
import { motion } from "framer-motion";
import type { ArtifactColumn, ArtifactRow } from "@/lib/mock-data";

interface AnnotatedTableProps {
  columns: ArtifactColumn[];
  rows: ArtifactRow[];
  /** Row ID after which to insert the inline interrupt slot */
  interruptAfterRowId?: string;
  /** Rendered interrupt component */
  interruptSlot?: React.ReactNode;
  /** Whether the interrupt has been resolved */
  interruptResolved?: boolean;
}

export default function AnnotatedTable({
  columns,
  rows,
  interruptAfterRowId,
  interruptSlot,
  interruptResolved = false,
}: AnnotatedTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Determine which rows to show
  const interruptIdx = interruptAfterRowId
    ? rows.findIndex((r) => r.row_id === interruptAfterRowId)
    : -1;

  // Rows before (and including) the interrupt anchor are always visible
  // Rows after are hidden until interrupt is resolved
  const visibleRows =
    interruptIdx >= 0 && !interruptResolved
      ? rows.slice(0, interruptIdx + 1)
      : rows;

  return (
    <div className="overflow-x-auto rounded-lg border border-border/50">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/50 bg-surface/80">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width, minWidth: col.width }}
                className="px-3 py-2 text-left text-[10px] uppercase tracking-[0.1em] text-muted font-medium whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row, idx) => (
            <Fragment key={row.row_id}>
              <motion.tr
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.02 }}
                onMouseEnter={() => setHoveredRow(row.row_id)}
                onMouseLeave={() => setHoveredRow(null)}
                className={`border-b border-border/30 transition-colors relative group ${
                  row.needs_attention
                    ? "border-l-2 border-l-warning/50"
                    : "border-l-2 border-l-transparent"
                } ${
                  hoveredRow === row.row_id
                    ? "bg-surface-alt/40"
                    : "bg-transparent hover:bg-surface/30"
                }`}
              >
                {columns.map((col) => {
                  const value = row.cells[col.key] ?? "";

                  return (
                    <td
                      key={col.key}
                      className="px-3 py-2 text-foreground/90 font-mono align-top relative"
                    >
                      {/* Flags column — render row.flags as badges */}
                      {col.key === "flags" ? (
                        row.flags && row.flags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {row.flags.map((flag) => (
                              <span
                                key={flag}
                                className="bg-warning/20 text-warning rounded-full px-2 py-0.5 text-[10px] font-medium"
                              >
                                {flag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted/30">—</span>
                        )
                      ) : col.key === "status" && value && value !== "—" ? (
                        /* Status column — colored badge */
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            value === "Mapped" || value === "Confirmed"
                              ? "bg-success/10 text-success"
                              : value === "Gap Identified"
                              ? "bg-error/15 text-error"
                              : value === "Needs input" || value === "Needs Input"
                              ? "bg-warning/20 text-warning"
                              : "bg-surface-alt text-muted"
                          }`}
                        >
                          {value}
                        </span>
                      ) : (
                        /* Default cell */
                        <span className={value === "—" ? "text-muted/30" : ""}>
                          {value}
                        </span>
                      )}
                    </td>
                  );
                })}

              </motion.tr>

              {/* Provenance detail row — appears below hovered row */}
              {row.provenance && hoveredRow === row.row_id && (
                <tr className="border-b border-border/20">
                  <td
                    colSpan={columns.length}
                    className="px-4 py-1.5 bg-surface/60"
                  >
                    <span className="text-[10px] font-mono text-muted">
                      {row.provenance}
                    </span>
                  </td>
                </tr>
              )}

              {/* Inline interrupt slot — inserted after anchor row */}
              {row.row_id === interruptAfterRowId && interruptSlot && (
                <tr>
                  <td colSpan={columns.length} className="p-0">
                    {interruptSlot}
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>

      {/* Rows hidden indicator */}
      {interruptIdx >= 0 && !interruptResolved && rows.length > visibleRows.length && (
        <div className="px-4 py-2 border-t border-border/30 text-[10px] text-muted font-mono">
          {rows.length - visibleRows.length} row
          {rows.length - visibleRows.length !== 1 ? "s" : ""} pending decision
        </div>
      )}
    </div>
  );
}
