"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getMatrixData,
  getCell,
  type AccountType,
  type LOBValue,
  type MatrixCell,
  type ReinsuranceLayer,
} from "@/lib/mock-hierarchy-data";

// ── Cell Detail Card ─────────────────────────────────────────────────────────

function CellDetailCard({ cell }: { cell: MatrixCell }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15 }}
      className="rounded-lg border border-border bg-surface p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">
          {cell.accountType} &times; {cell.lob}
        </h4>
        <span
          className={`text-[11px] font-mono px-2 py-0.5 rounded ${
            cell.active
              ? "bg-success/15 text-success border border-success/30"
              : "bg-surface-alt text-muted border border-border"
          }`}
        >
          {cell.active ? "ACTIVE" : "UNUSED"}
        </span>
      </div>

      {cell.active && (
        <>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-[11px] uppercase tracking-[0.1em] text-faint block">Accounts</span>
              <span className="font-mono text-foreground">{cell.accountCount}</span>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-[0.1em] text-faint block">Postings</span>
              <span className="font-mono text-foreground">{cell.postingCount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-[0.1em] text-faint block">Volume</span>
              <span className="font-mono text-foreground">{cell.dollarVolume}</span>
            </div>
          </div>

          {cell.reinsuranceBreakdown && (
            <div>
              <span className="text-[11px] uppercase tracking-[0.1em] text-faint block mb-1.5">
                Reinsurance Split
              </span>
              <div className="flex gap-2">
                {Object.entries(cell.reinsuranceBreakdown).map(([type, pct]) => (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1 rounded bg-surface-alt px-2 py-0.5 text-[11px] font-mono text-secondary border border-border/50"
                  >
                    <span className="text-accent">{type}</span>
                    <span className="text-muted">{pct}%</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="text-[11px] uppercase tracking-[0.1em] text-faint block mb-1">
              Top Accounts
            </span>
            <div className="space-y-0.5">
              {cell.topAccounts.map((acct) => (
                <p key={acct} className="text-sm font-mono text-secondary">{acct}</p>
              ))}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function DimensionalMatrix() {
  const data = getMatrixData();
  const [selectedCell, setSelectedCell] = useState<{ at: AccountType; lob: LOBValue } | null>(null);
  const [reinsLayer, setReinsLayer] = useState<ReinsuranceLayer>("All");

  const selected = selectedCell ? getCell(selectedCell.at, selectedCell.lob) : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground uppercase tracking-wide">
            Dimensional Matrix: Account Type &times; LOB
          </h3>
          <p className="text-sm text-muted mt-1">
            Coverage: {data.activeCount} of {data.totalPossible} possible combinations ({data.coveragePct}%)
          </p>
        </div>

        {/* Reinsurance Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.1em] text-faint">Reinsurance</span>
          <select
            value={reinsLayer}
            onChange={(e) => setReinsLayer(e.target.value as ReinsuranceLayer)}
            className="rounded border border-border bg-surface px-2 py-1 text-sm text-foreground font-mono focus:border-accent focus:outline-none"
          >
            <option value="All">All</option>
            <option value="QS">Quota Share</option>
            <option value="XOL">Excess of Loss</option>
            <option value="Fac">Facultative</option>
            <option value="Net">Net</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="rounded-lg border border-border bg-surface/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-muted w-[140px]">
                Account Type
              </th>
              {data.lobValues.map((lob) => (
                <th
                  key={lob}
                  className="px-4 py-3 text-center text-[11px] uppercase tracking-[0.1em] text-muted font-mono"
                >
                  {lob}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.accountTypes.map((at) => (
              <tr key={at} className="border-b border-border/30">
                <td className="px-4 py-3 text-sm font-medium text-secondary">{at}</td>
                {data.lobValues.map((lob) => {
                  const cell = getCell(at, lob);
                  const isSelected = selectedCell?.at === at && selectedCell?.lob === lob;

                  return (
                    <td key={lob} className="px-4 py-3 text-center">
                      <button
                        onClick={() =>
                          setSelectedCell(isSelected ? null : { at, lob })
                        }
                        className={`inline-flex items-center justify-center w-10 h-10 rounded-md transition-all duration-150 ${
                          cell?.active
                            ? isSelected
                              ? "bg-success/30 border-2 border-success ring-1 ring-success/30"
                              : "bg-success/15 border border-success/30 hover:bg-success/25"
                            : isSelected
                              ? "bg-surface-alt border-2 border-muted"
                              : "bg-surface-alt/40 border border-border/30 hover:bg-surface-alt/60"
                        }`}
                        title={`${at} x ${lob}: ${cell?.active ? `${cell.accountCount} accounts` : "unused"}`}
                      >
                        {cell?.active ? (
                          <span className="text-[11px] font-mono text-success">
                            {cell.accountCount}
                          </span>
                        ) : (
                          <span className="text-[11px] text-faint">&mdash;</span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cell Detail */}
      <AnimatePresence mode="wait">
        {selected && (
          <CellDetailCard key={`${selectedCell?.at}-${selectedCell?.lob}`} cell={selected} />
        )}
      </AnimatePresence>

      {/* Rationalization Insights */}
      <div className="space-y-2">
        <h4 className="text-[11px] uppercase tracking-[0.1em] text-muted font-medium">
          Rationalization Insights
        </h4>
        <div className="space-y-1.5">
          <div className="flex items-start gap-2 text-sm">
            <span className="text-warning mt-0.5 shrink-0">&#9888;</span>
            <span className="text-secondary">
              {data.unusedCount} unused combinations — potential simplification opportunity
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <span className="text-warning mt-0.5 shrink-0">&#9888;</span>
            <span className="text-secondary">
              Equity &times; LOB: no LOB-specific equity accounts (expected for P&amp;C carriers)
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <span className="text-accent mt-0.5 shrink-0">&#9432;</span>
            <span className="text-secondary">
              Revenue &times; (none): no non-LOB revenue accounts — all premium revenue is LOB-tagged
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
