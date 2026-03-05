"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useCOAStore,
  coaStoreKey,
} from "@/lib/coa-store";
import {
  getMatrixData,
  getCell,
  type AccountType,
  type LOBValue,
  type MatrixCell,
} from "@/lib/mock-hierarchy-data";

// ── Types ────────────────────────────────────────────────────────────────────

type GapSeverity = "compliance" | "reporting" | "acceptable";

interface GapInfo {
  accountType: string;
  lob: string;
  severity: GapSeverity;
  reason: string;
  recommendation: string;
}

interface DimensionalMatrixProps {
  engagementId: string;
  deliverableId: string;
  onAskAgent?: (message: string) => void;
}

// ── Gap Analysis ─────────────────────────────────────────────────────────────

function computeGaps(
  accountTypes: string[],
  lobValues: string[],
  storeAccountTypes?: string[],
  storeLOBs?: string[],
): GapInfo[] {
  const gaps: GapInfo[] = [];

  // Compliance gaps — NAIC requires certain LOB x Account Type combinations
  const complianceRequired: [string, string, string][] = [
    ["Revenue", "WC", "NAIC Schedule P requires WC premium tracking by state"],
    ["Expense", "WC", "NAIC requires WC loss/expense split for rate filing"],
    ["Liabilities", "WC", "Loss reserves by LOB required for Schedule P Part 1"],
  ];

  for (const [at, lob, reason] of complianceRequired) {
    const cell = getCell(at as AccountType, lob as LOBValue);
    if (!cell?.active) {
      gaps.push({
        accountType: at,
        lob,
        severity: "compliance",
        reason,
        recommendation: `Create ${at.toLowerCase()} accounts tagged with LOB=${lob} to meet statutory reporting requirements`,
      });
    }
  }

  // Reporting gaps — expected combinations that are missing
  for (const at of accountTypes) {
    for (const lob of lobValues) {
      if (lob === "(none)") continue;
      const cell = getCell(at as AccountType, lob as LOBValue);
      if (!cell?.active && at !== "Equity") {
        // Skip if already flagged as compliance
        if (gaps.some((g) => g.accountType === at && g.lob === lob)) continue;
        gaps.push({
          accountType: at,
          lob,
          severity: "reporting",
          reason: `No ${at.toLowerCase()} accounts for ${lob} — limits LOB-level management reporting`,
          recommendation: `Consider adding ${at.toLowerCase()} accounts for ${lob} if this LOB is active`,
        });
      }
    }
  }

  // Acceptable gaps — Equity by LOB is expected to be empty for P&C
  for (const lob of lobValues) {
    if (lob === "(none)") continue;
    const cell = getCell("Equity" as AccountType, lob as LOBValue);
    if (!cell?.active) {
      gaps.push({
        accountType: "Equity",
        lob,
        severity: "acceptable",
        reason: "P&C carriers typically maintain equity at entity level, not LOB level",
        recommendation: "No action needed — this is expected for P&C insurance carriers",
      });
    }
  }

  return gaps;
}

const SEVERITY_STYLES: Record<GapSeverity, { cell: string; badge: string; label: string }> = {
  compliance: {
    cell: "bg-error/20 border-error/40",
    badge: "bg-error/20 text-error",
    label: "COMPLIANCE",
  },
  reporting: {
    cell: "bg-warning/15 border-warning/30",
    badge: "bg-warning/20 text-warning",
    label: "REPORTING",
  },
  acceptable: {
    cell: "bg-surface-alt/30 border-border/30",
    badge: "bg-surface-alt text-muted",
    label: "EXPECTED",
  },
};

// ── Main Component ───────────────────────────────────────────────────────────

export function DimensionalMatrix({
  engagementId,
  deliverableId,
  onAskAgent,
}: DimensionalMatrixProps) {
  const storeKey = coaStoreKey(engagementId, deliverableId);
  const store = useCOAStore((s) => s.getStore(storeKey));

  const data = getMatrixData();
  const [selectedCell, setSelectedCell] = useState<{ at: string; lob: string } | null>(null);

  // Derive axes from store if available
  const accountTypes = useMemo(() => {
    if (store?.code_blocks && store.code_blocks.length > 0) {
      const types = [...new Set(store.code_blocks.map((cb) => cb.account_type))];
      return types.length > 0 ? types : data.accountTypes;
    }
    return data.accountTypes;
  }, [store?.code_blocks, data.accountTypes]);

  const lobValues = useMemo(() => {
    if (store?.dimensions) {
      const lobDim = store.dimensions.find(
        (d) => d.dimension.toLowerCase().includes("lob") || d.dimension.toLowerCase().includes("line of business")
      );
      if (lobDim?.key_values) {
        const vals = lobDim.key_values.split(",").map((v) => v.trim()).filter(Boolean);
        if (vals.length > 0) return [...vals, "(none)"];
      }
    }
    return data.lobValues;
  }, [store?.dimensions, data.lobValues]);

  const gaps = useMemo(
    () => computeGaps(accountTypes, lobValues),
    [accountTypes, lobValues]
  );

  const complianceCount = gaps.filter((g) => g.severity === "compliance").length;
  const reportingCount = gaps.filter((g) => g.severity === "reporting").length;
  const totalGaps = gaps.length;

  const selectedGap = selectedCell
    ? gaps.find((g) => g.accountType === selectedCell.at && g.lob === selectedCell.lob)
    : undefined;

  const selectedMatrixCell = selectedCell
    ? getCell(selectedCell.at as AccountType, selectedCell.lob as LOBValue)
    : undefined;

  return (
    <div className="space-y-6">
      {/* Header + summary bar */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground uppercase tracking-wide">
            Dimensional Matrix: Account Type &times; LOB
          </h3>
          <p className="text-sm text-muted mt-1">
            Coverage: {data.activeCount} of {data.totalPossible} ({data.coveragePct}%)
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-foreground">{totalGaps} gaps</span>
          {complianceCount > 0 && (
            <span className="text-error">{complianceCount} compliance</span>
          )}
          {reportingCount > 0 && (
            <span className="text-warning">{reportingCount} reporting</span>
          )}
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
              {(lobValues as string[]).map((lob) => (
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
            {(accountTypes as string[]).map((at) => (
              <tr key={at} className="border-b border-border/30">
                <td className="px-4 py-3 text-sm font-medium text-secondary">{at}</td>
                {(lobValues as string[]).map((lob) => {
                  const cell = getCell(at as AccountType, lob as LOBValue);
                  const gap = gaps.find((g) => g.accountType === at && g.lob === lob);
                  const isSelected = selectedCell?.at === at && selectedCell?.lob === lob;

                  if (cell?.active) {
                    return (
                      <td key={lob} className="px-4 py-3 text-center">
                        <button
                          onClick={() =>
                            setSelectedCell(isSelected ? null : { at, lob })
                          }
                          className={`inline-flex items-center justify-center w-10 h-10 rounded-md transition-all ${
                            isSelected
                              ? "bg-success/30 border-2 border-success ring-1 ring-success/30"
                              : "bg-success/15 border border-success/30 hover:bg-success/25"
                          }`}
                          title={`${at} x ${lob}: ${cell.accountCount} accounts`}
                        >
                          <span className="text-[11px] font-mono text-success">
                            {cell.accountCount}
                          </span>
                        </button>
                      </td>
                    );
                  }

                  // Gap cell
                  const severity = gap?.severity ?? "acceptable";
                  const style = SEVERITY_STYLES[severity];

                  return (
                    <td key={lob} className="px-4 py-3 text-center">
                      <button
                        onClick={() =>
                          setSelectedCell(isSelected ? null : { at, lob })
                        }
                        className={`inline-flex items-center justify-center w-10 h-10 rounded-md transition-all border ${
                          isSelected
                            ? `${style.cell} ring-1 ring-current`
                            : `${style.cell} hover:opacity-80`
                        }`}
                        title={gap ? `${gap.severity}: ${gap.reason}` : `${at} x ${lob}: unused`}
                      >
                        {severity === "compliance" ? (
                          <span className="text-[11px] text-error">&#9888;</span>
                        ) : severity === "reporting" ? (
                          <span className="text-[11px] text-warning">&#9679;</span>
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

      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-success/20 border border-success/30" />
          <span className="text-muted">Active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-error/20 border border-error/40" />
          <span className="text-muted">Compliance gap</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-warning/15 border border-warning/30" />
          <span className="text-muted">Reporting gap</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-surface-alt/30 border border-border/30" />
          <span className="text-muted">Expected / acceptable</span>
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence mode="wait">
        {selectedCell && (selectedGap || selectedMatrixCell) && (
          <motion.div
            key={`${selectedCell.at}-${selectedCell.lob}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="rounded-lg border border-border bg-surface p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">
                {selectedCell.at} &times; {selectedCell.lob}
              </h4>
              {selectedGap ? (
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${SEVERITY_STYLES[selectedGap.severity].badge}`}>
                  {SEVERITY_STYLES[selectedGap.severity].label}
                </span>
              ) : selectedMatrixCell?.active ? (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-success/15 text-success border border-success/30">
                  ACTIVE
                </span>
              ) : null}
            </div>

            {selectedGap && (
              <>
                <div>
                  <span className="text-[11px] uppercase tracking-[0.1em] text-faint block">Reason</span>
                  <p className="text-sm text-secondary mt-0.5">{selectedGap.reason}</p>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-[0.1em] text-faint block">Recommendation</span>
                  <p className="text-sm text-foreground mt-0.5">{selectedGap.recommendation}</p>
                </div>
                {onAskAgent && (
                  <button
                    onClick={() =>
                      onAskAgent(
                        `Propose a fix for the ${selectedGap.severity} gap: ${selectedCell.at} x ${selectedCell.lob}. ${selectedGap.reason}`
                      )
                    }
                    className="flex items-center gap-1.5 rounded border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors"
                  >
                    Ask agent to propose fix
                  </button>
                )}
              </>
            )}

            {selectedMatrixCell?.active && (
              <>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-[11px] uppercase tracking-[0.1em] text-faint block">Accounts</span>
                    <span className="font-mono text-foreground">{selectedMatrixCell.accountCount}</span>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-[0.1em] text-faint block">Postings</span>
                    <span className="font-mono text-foreground">{selectedMatrixCell.postingCount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-[0.1em] text-faint block">Volume</span>
                    <span className="font-mono text-foreground">{selectedMatrixCell.dollarVolume}</span>
                  </div>
                </div>
                {selectedMatrixCell.topAccounts.length > 0 && (
                  <div>
                    <span className="text-[11px] uppercase tracking-[0.1em] text-faint block mb-1">Top Accounts</span>
                    <div className="space-y-0.5">
                      {selectedMatrixCell.topAccounts.map((acct) => (
                        <p key={acct} className="text-sm font-mono text-secondary">{acct}</p>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
