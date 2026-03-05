"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  type Perspective,
  type FSLINode,
  type HierarchyClassification,
  FSLI_BY_PERSPECTIVE,
} from "@/lib/mock-hierarchy-data";
import { useHierarchyStore, hierarchyStoreKey } from "@/lib/hierarchy-store";
import { TierBadge } from "./TierBadge";
import { HierarchyAuditCard } from "./HierarchyAuditCard";

// ── Perspectives ─────────────────────────────────────────────────────────────

const PERSPECTIVES: { id: Perspective; label: string }[] = [
  { id: "STAT", label: "STAT" },
  { id: "GAAP", label: "GAAP" },
  { id: "IFRS17", label: "IFRS 17" },
];

// ── FSLI Tree Node ───────────────────────────────────────────────────────────

function FSLITreeNode({
  node,
  children,
  isSelected,
  onSelect,
  filteredCount,
}: {
  node: FSLINode;
  children: FSLINode[];
  isSelected: boolean;
  onSelect: (id: string) => void;
  filteredCount: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = children.length > 0;

  return (
    <div>
      <button
        onClick={() => {
          onSelect(node.id);
          if (hasChildren) setExpanded(!expanded);
        }}
        className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors rounded-md ${
          isSelected
            ? "bg-accent/15 text-foreground border border-accent/30"
            : "hover:bg-surface-alt/50 text-secondary"
        }`}
      >
        {hasChildren && (
          <svg
            className={`w-3 h-3 text-muted transition-transform shrink-0 ${
              expanded ? "rotate-90" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        )}
        {!hasChildren && <span className="w-3" />}
        <span className="flex-1 truncate">{node.label}</span>
        <span className="text-[11px] font-mono text-muted shrink-0">
          ({filteredCount})
        </span>
      </button>

      {expanded &&
        children.map((child) => (
          <div key={child.id} className="pl-5">
            <button
              onClick={() => onSelect(child.id)}
              className={`w-full flex items-center gap-2 px-3 py-1 text-left text-sm transition-colors rounded-md ${
                isSelected && child.id === node.id
                  ? "bg-accent/15 text-foreground"
                  : "hover:bg-surface-alt/50 text-muted"
              }`}
            >
              <span className="w-3" />
              <span className="flex-1 truncate">{child.label}</span>
              <span className="text-[11px] font-mono text-faint">
                ({child.accountCount})
              </span>
            </button>
          </div>
        ))}
    </div>
  );
}

// ── Account Row ──────────────────────────────────────────────────────────────

function AccountRow({
  classification,
  isSelected,
  onSelect,
  onApprove,
  onReject,
}: {
  classification: HierarchyClassification;
  isSelected: boolean;
  onSelect: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const c = classification;
  const isPending = c.status === "agent_proposed";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(); }}
      className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors rounded-md cursor-pointer ${
        isSelected
          ? "bg-surface-alt border border-border"
          : "hover:bg-surface-alt/30"
      } ${isPending ? "border-l-2 border-l-warning" : ""}`}
    >
      <span className="font-mono text-foreground w-[60px] shrink-0">{c.accountCode}</span>
      <span className="text-secondary flex-1 truncate">{c.accountName}</span>
      <TierBadge tier={c.tier} status={c.status} compact />

      {isPending && (
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onApprove}
            className="rounded bg-success/20 px-2 py-0.5 text-[11px] font-medium text-success hover:bg-success/30 transition-colors"
          >
            Approve
          </button>
          <button
            onClick={onReject}
            className="rounded bg-error/20 px-2 py-0.5 text-[11px] font-medium text-error hover:bg-error/30 transition-colors"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

interface DynamicHierarchyProps {
  engagementId: string;
  deliverableId: string;
}

export function DynamicHierarchy({ engagementId, deliverableId }: DynamicHierarchyProps) {
  const storeKey = hierarchyStoreKey(engagementId, deliverableId);
  const store = useHierarchyStore((s) => s.getStore(storeKey));
  const seed = useHierarchyStore((s) => s.seed);
  const setPerspective = useHierarchyStore((s) => s.setPerspective);
  const selectAccount = useHierarchyStore((s) => s.selectAccount);
  const selectFsliNode = useHierarchyStore((s) => s.selectFsliNode);
  const approve = useHierarchyStore((s) => s.approveClassification);
  const reject = useHierarchyStore((s) => s.rejectClassification);

  useEffect(() => {
    seed(storeKey);
  }, [storeKey, seed]);

  const perspective = store?.activePerspective ?? "STAT";
  const classifications = store?.classifications ?? [];
  const selectedAccountId = store?.selectedAccountId ?? null;
  const selectedFsliNodeId = store?.selectedFsliNodeId ?? null;

  const fsli = FSLI_BY_PERSPECTIVE[perspective];
  const topLevelNodes = fsli.filter((n) => n.parentId === null);

  // Group classifications by tier
  const { tier1, tier2, tier3 } = useMemo(() => {
    return {
      tier1: classifications.filter((c) => c.tier === "tier1"),
      tier2: classifications.filter((c) => c.tier === "tier2"),
      tier3: classifications.filter((c) => c.tier === "tier3"),
    };
  }, [classifications]);

  // Filter by FSLI node selection
  const filteredClassifications = useMemo(() => {
    if (!selectedFsliNodeId) return classifications;
    // Include accounts that map to selected node or its children
    const childIds = fsli
      .filter((n) => n.parentId === selectedFsliNodeId)
      .map((n) => n.id);
    const matchIds = new Set([selectedFsliNodeId, ...childIds]);
    return classifications.filter((c) => {
      const nodeId = c.perspectives[perspective];
      return matchIds.has(nodeId);
    });
  }, [classifications, selectedFsliNodeId, fsli, perspective]);

  const selectedClassification = classifications.find(
    (c) => c.accountId === selectedAccountId
  );

  const pendingCount = tier3.filter((c) => c.status === "agent_proposed").length;
  const totalClassified = classifications.length;

  // Count accounts per FSLI top-level node
  function countForNode(nodeId: string): number {
    const childIds = fsli.filter((n) => n.parentId === nodeId).map((n) => n.id);
    const matchIds = new Set([nodeId, ...childIds]);
    return classifications.filter((c) => matchIds.has(c.perspectives[perspective])).length;
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="shrink-0 flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-foreground uppercase tracking-wide">
            Dynamic Hierarchy — FSLI Classification
          </h3>
          <p className="text-sm text-muted mt-1">
            Coverage: {totalClassified - pendingCount}/{totalClassified} classified (
            {Math.round(((totalClassified - pendingCount) / totalClassified) * 100)}%)
            {pendingCount > 0 && (
              <span className="text-warning ml-1">
                &middot; {pendingCount} pending agent review
              </span>
            )}
          </p>
        </div>

        {/* Perspective Toggle */}
        <div className="flex rounded-lg border border-border overflow-hidden">
          {PERSPECTIVES.map((p) => (
            <button
              key={p.id}
              onClick={() => setPerspective(storeKey, p.id)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                perspective === p.id
                  ? "bg-accent text-foreground"
                  : "bg-surface text-muted hover:text-foreground hover:bg-surface-alt"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Split View */}
      <div className="flex flex-1 min-h-0 gap-4">
        {/* Left: FSLI Tree (35%) */}
        <div className="w-[35%] shrink-0 flex flex-col min-h-0 rounded-lg border border-border bg-surface/30 overflow-hidden">
          <div className="shrink-0 px-3 py-2 border-b border-border">
            <span className="text-[11px] uppercase tracking-[0.1em] text-muted font-medium">
              FSLI Structure
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {topLevelNodes.map((node) => {
              const children = fsli.filter((n) => n.parentId === node.id);
              return (
                <FSLITreeNode
                  key={node.id}
                  node={node}
                  children={children}
                  isSelected={selectedFsliNodeId === node.id}
                  onSelect={(id) => selectFsliNode(storeKey, id)}
                  filteredCount={countForNode(node.id)}
                />
              );
            })}
          </div>
        </div>

        {/* Right: Account List (65%) */}
        <div className="flex-1 flex flex-col min-h-0 rounded-lg border border-border bg-surface/30 overflow-hidden">
          <div className="shrink-0 px-3 py-2 border-b border-border">
            <span className="text-[11px] uppercase tracking-[0.1em] text-muted font-medium">
              Account Classifications
              {selectedFsliNodeId && (
                <button
                  onClick={() => selectFsliNode(storeKey, null)}
                  className="ml-2 text-accent hover:text-foreground transition-colors"
                >
                  (clear filter)
                </button>
              )}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {/* Tier 1 */}
            {filteredClassifications.filter((c) => c.tier === "tier1").length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-2 px-3 py-1.5 mb-1">
                  <TierBadge tier="tier1" />
                  <span className="text-[11px] font-mono text-muted">
                    ({filteredClassifications.filter((c) => c.tier === "tier1").length})
                  </span>
                </div>
                <div className="space-y-0.5">
                  {filteredClassifications
                    .filter((c) => c.tier === "tier1")
                    .map((c) => (
                      <AccountRow
                        key={c.accountId}
                        classification={c}
                        isSelected={selectedAccountId === c.accountId}
                        onSelect={() => selectAccount(storeKey, c.accountId)}
                        onApprove={() => approve(storeKey, c.accountId, "Consultant")}
                        onReject={() => reject(storeKey, c.accountId, "Rejected by consultant")}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Tier 2 */}
            {filteredClassifications.filter((c) => c.tier === "tier2").length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-2 px-3 py-1.5 mb-1">
                  <TierBadge tier="tier2" />
                  <span className="text-[11px] font-mono text-muted">
                    ({filteredClassifications.filter((c) => c.tier === "tier2").length})
                  </span>
                </div>
                <div className="space-y-0.5">
                  {filteredClassifications
                    .filter((c) => c.tier === "tier2")
                    .map((c) => (
                      <AccountRow
                        key={c.accountId}
                        classification={c}
                        isSelected={selectedAccountId === c.accountId}
                        onSelect={() => selectAccount(storeKey, c.accountId)}
                        onApprove={() => approve(storeKey, c.accountId, "Consultant")}
                        onReject={() => reject(storeKey, c.accountId, "Rejected by consultant")}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Tier 3 */}
            {filteredClassifications.filter((c) => c.tier === "tier3").length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-2 px-3 py-1.5 mb-1">
                  <TierBadge tier="tier3" />
                  <span className="text-[11px] font-mono text-muted">
                    ({filteredClassifications.filter((c) => c.tier === "tier3").length})
                  </span>
                  {pendingCount > 0 && (
                    <span className="text-[11px] text-warning font-mono">
                      {pendingCount} awaiting approval
                    </span>
                  )}
                </div>
                <div className="space-y-0.5">
                  {filteredClassifications
                    .filter((c) => c.tier === "tier3")
                    .map((c) => (
                      <AccountRow
                        key={c.accountId}
                        classification={c}
                        isSelected={selectedAccountId === c.accountId}
                        onSelect={() => selectAccount(storeKey, c.accountId)}
                        onApprove={() => approve(storeKey, c.accountId, "Consultant")}
                        onReject={() => reject(storeKey, c.accountId, "Rejected by consultant")}
                      />
                    ))}
                </div>
              </div>
            )}

            {filteredClassifications.length === 0 && (
              <p className="text-sm text-faint text-center py-8">
                No accounts match this filter.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Audit Card */}
      <div className="shrink-0 mt-4">
        <AnimatePresence mode="wait">
          {selectedClassification && (
            <HierarchyAuditCard
              key={selectedClassification.accountId}
              classification={selectedClassification}
            />
          )}
        </AnimatePresence>
        {!selectedClassification && (
          <div className="rounded-lg border border-border/50 bg-surface/30 px-4 py-3 text-center">
            <p className="text-sm text-faint">
              Select an account to view its audit trail
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
