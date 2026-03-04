"use client";

import { useMemo } from "react";
import {
  useCOAStore,
  coaStoreKey,
  type DeliverableStatus,
  type TabId,
} from "@/lib/coa-store";
import {
  useHierarchyStore,
  hierarchyStoreKey,
} from "@/lib/hierarchy-store";
import {
  ACCOUNT_STRING_SEGMENTS,
  getMatrixData,
  type Perspective,
} from "@/lib/mock-hierarchy-data";

// ── Types ────────────────────────────────────────────────────────────────────

type Readiness = "ready" | "warning" | "blocking";

interface SectionReadiness {
  status: Readiness;
  label: string;
}

interface COADeliverableProps {
  engagementId: string;
  deliverableId: string;
  onNavigateToTab: (tabId: TabId) => void;
}

// ── Status Lifecycle ─────────────────────────────────────────────────────────

const STATUS_LABELS: Record<DeliverableStatus, string> = {
  draft: "Draft",
  ready_for_review: "Ready for Review",
  under_review: "Under Review",
  approved: "Approved",
};

const STATUS_TRANSITIONS: Record<DeliverableStatus, DeliverableStatus[]> = {
  draft: ["ready_for_review"],
  ready_for_review: ["under_review", "draft"],
  under_review: ["approved", "draft"],
  approved: ["draft"],
};

const STATUS_STYLES: Record<DeliverableStatus, string> = {
  draft: "bg-surface-alt text-muted",
  ready_for_review: "bg-accent/20 text-accent",
  under_review: "bg-warning/20 text-warning",
  approved: "bg-success/20 text-success",
};

// ── Readiness Badge ──────────────────────────────────────────────────────────

function ReadinessBadge({ readiness }: { readiness: SectionReadiness }) {
  if (readiness.status === "ready") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-success">
        <span className="w-2 h-2 rounded-full bg-success" />
        Ready
      </span>
    );
  }
  if (readiness.status === "warning") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-warning">
        <span className="w-2 h-2 rounded-full bg-warning" />
        {readiness.label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-error">
      <span className="w-2 h-2 rounded-full bg-error" />
      {readiness.label}
    </span>
  );
}

// ── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({
  number,
  title,
  readiness,
  editTab,
  onEdit,
}: {
  number: number;
  title: string;
  readiness: SectionReadiness;
  editTab?: TabId;
  onEdit?: (tabId: TabId) => void;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg text-foreground" style={{ fontFamily: "var(--font-display)" }}>
        <span className="text-muted mr-2">{number}.</span>
        {title}
      </h3>
      <div className="flex items-center gap-3">
        <ReadinessBadge readiness={readiness} />
        {editTab && onEdit && readiness.status !== "ready" && (
          <button
            onClick={() => onEdit(editTab)}
            className="text-[11px] font-mono text-accent hover:text-accent/80 transition-colors"
          >
            Edit &rarr;
          </button>
        )}
      </div>
    </div>
  );
}

// ── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/50 bg-surface/40 px-5 py-4">
      {children}
    </div>
  );
}

// ── Summary Line ─────────────────────────────────────────────────────────────

function SummaryLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 text-xs text-muted font-mono">{children}</p>
  );
}

// ── Deliverable Status Bar ───────────────────────────────────────────────────

function DeliverableStatusBar({
  readyCount,
  totalSections,
  status,
  modifiedAt,
  onStatusChange,
}: {
  readyCount: number;
  totalSections: number;
  status: DeliverableStatus;
  modifiedAt: string | null;
  onStatusChange: (status: DeliverableStatus) => void;
}) {
  const pct = Math.round((readyCount / totalSections) * 100);
  const transitions = STATUS_TRANSITIONS[status];

  return (
    <div className="rounded-lg border border-border/50 bg-surface/40 px-5 py-4 mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          {/* Progress bar */}
          <div className="w-40 h-2 rounded-full bg-surface-alt overflow-hidden">
            <div
              className="h-full rounded-full bg-success transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-sm font-mono text-foreground">
            {readyCount}/{totalSections} Ready
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Status badge */}
          <span className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider ${STATUS_STYLES[status]}`}>
            {STATUS_LABELS[status]}
          </span>
          {/* Transition buttons */}
          {transitions.map((next) => (
            <button
              key={next}
              onClick={() => onStatusChange(next)}
              className="px-3 py-1 rounded border border-border text-xs font-mono text-muted hover:text-foreground hover:border-border-strong transition-colors"
            >
              {next === "draft" ? "Reset to Draft" : STATUS_LABELS[next]}
            </button>
          ))}
        </div>
      </div>
      {modifiedAt && (
        <p className="text-[11px] text-faint font-mono">
          Last modified: {new Date(modifiedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      )}
    </div>
  );
}

// ── Section 1: Executive Summary ─────────────────────────────────────────────

function ExecSummarySection({ summary }: { summary: string }) {
  if (!summary) {
    return (
      <SectionCard>
        <p className="text-sm text-faint italic">No executive summary generated yet. Run the agent to generate a COA design summary.</p>
      </SectionCard>
    );
  }
  return (
    <SectionCard>
      <p className="text-sm text-secondary leading-relaxed" style={{ fontFamily: "var(--font-display)" }}>
        {summary}
      </p>
    </SectionCard>
  );
}

// ── Section 2: Account String ────────────────────────────────────────────────

function AccountStringSection() {
  const segments = ACCOUNT_STRING_SEGMENTS;
  const totalLength = segments.reduce((s, seg) => s + seg.length, 0);
  const mandatoryCount = segments.filter((s) => s.mandatory).length;

  return (
    <SectionCard>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.1em] text-muted">
            <th className="px-3 py-2">Segment</th>
            <th className="px-3 py-2 text-right">Length</th>
            <th className="px-3 py-2 text-right">Values</th>
            <th className="px-3 py-2 text-right">Fill %</th>
            <th className="px-3 py-2 text-center">Req</th>
            <th className="px-3 py-2">Statutory Alignment</th>
          </tr>
        </thead>
        <tbody>
          {segments.map((seg) => (
            <tr key={seg.id} className="border-b border-border/30">
              <td className="px-3 py-2 font-mono text-foreground">{seg.name}</td>
              <td className="px-3 py-2 text-right font-mono text-secondary">{seg.length} chr</td>
              <td className="px-3 py-2 text-right font-mono text-secondary">{seg.cardinality}</td>
              <td className="px-3 py-2 text-right font-mono text-secondary">{seg.fillRate}%</td>
              <td className="px-3 py-2 text-center">
                {seg.mandatory ? (
                  <span className="text-success">&#10003;</span>
                ) : (
                  <span className="text-faint">&mdash;</span>
                )}
              </td>
              <td className="px-3 py-2 text-secondary">{seg.statAlignment}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <SummaryLine>
        Total: {totalLength} characters &middot; {segments.length} segments &middot; {mandatoryCount} mandatory
      </SummaryLine>
    </SectionCard>
  );
}

// ── Section 3: Code Blocks ───────────────────────────────────────────────────

function CodeBlocksSection({
  blocks,
}: {
  blocks: { range: string; account_type: string; stat_alignment: string; count: number }[];
}) {
  const totalAccounts = blocks.reduce((s, b) => s + b.count, 0);

  return (
    <SectionCard>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.1em] text-muted">
            <th className="px-3 py-2">Range</th>
            <th className="px-3 py-2">Account Type</th>
            <th className="px-3 py-2">STAT Alignment</th>
            <th className="px-3 py-2 text-right">Count</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((cb) => (
            <tr key={cb.range} className="border-b border-border/30">
              <td className="px-3 py-2 font-mono text-foreground">{cb.range}</td>
              <td className="px-3 py-2 text-secondary">{cb.account_type}</td>
              <td className="px-3 py-2 text-secondary">{cb.stat_alignment}</td>
              <td className="px-3 py-2 text-right font-mono text-secondary">{cb.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <SummaryLine>
        Total: {totalAccounts} accounts across {blocks.length} code blocks
      </SummaryLine>
    </SectionCard>
  );
}

// ── Section 4: Account Groups ────────────────────────────────────────────────

function AccountGroupsSection({
  groups,
}: {
  groups: { group_code: string; name: string; stat_schedule_line: string; account_count: number }[];
}) {
  return (
    <SectionCard>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.1em] text-muted">
            <th className="px-3 py-2">Group</th>
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Statutory Schedule Line</th>
            <th className="px-3 py-2 text-right">Count</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((ag) => (
            <tr key={ag.group_code} className="border-b border-border/30">
              <td className="px-3 py-2 font-mono text-foreground">{ag.group_code}</td>
              <td className="px-3 py-2 text-secondary">{ag.name}</td>
              <td className="px-3 py-2 text-secondary">{ag.stat_schedule_line}</td>
              <td className="px-3 py-2 text-right font-mono text-secondary">{ag.account_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionCard>
  );
}

// ── Section 5: Dimensions ────────────────────────────────────────────────────

function DimensionsSection({
  dimensions,
  openIssueCount,
}: {
  dimensions: {
    dimension: string;
    fill_rate: number;
    unique_values: number;
    mandatory: boolean;
    reporting_purpose: string;
    issues: { status: string }[];
  }[];
  openIssueCount: number;
}) {
  return (
    <SectionCard>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.1em] text-muted">
            <th className="px-3 py-2">Dimension</th>
            <th className="px-3 py-2 text-right">Fill %</th>
            <th className="px-3 py-2 text-right">Values</th>
            <th className="px-3 py-2 text-center">Req</th>
            <th className="px-3 py-2">Purpose</th>
          </tr>
        </thead>
        <tbody>
          {dimensions.map((dim) => (
            <tr key={dim.dimension} className="border-b border-border/30">
              <td className="px-3 py-2 font-mono text-foreground">{dim.dimension}</td>
              <td className="px-3 py-2 text-right font-mono text-secondary">{dim.fill_rate}%</td>
              <td className="px-3 py-2 text-right font-mono text-secondary">{dim.unique_values}</td>
              <td className="px-3 py-2 text-center">
                {dim.mandatory ? (
                  <span className="text-success">&#10003;</span>
                ) : (
                  <span className="text-faint">&mdash;</span>
                )}
              </td>
              <td className="px-3 py-2 text-secondary">{dim.reporting_purpose}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {openIssueCount > 0 && (
        <SummaryLine>Open issues: {openIssueCount} flagged for resolution</SummaryLine>
      )}
    </SectionCard>
  );
}

// ── Section 6: FSLI Hierarchy ────────────────────────────────────────────────

function HierarchySection({
  engagementId,
  deliverableId,
}: {
  engagementId: string;
  deliverableId: string;
}) {
  const hKey = hierarchyStoreKey(engagementId, deliverableId);
  const hStore = useHierarchyStore((s) => s.getStore(hKey));

  if (!hStore) {
    return (
      <SectionCard>
        <p className="text-sm text-faint italic">Hierarchy not yet seeded.</p>
      </SectionCard>
    );
  }

  const classifications = hStore.classifications;
  const perspectives: Perspective[] = ["STAT", "GAAP", "IFRS17"];

  const perspectiveStats = perspectives.map((p) => {
    const total = classifications.length;
    const tier1 = classifications.filter((c) => c.tier === "tier1").length;
    const tier2 = classifications.filter((c) => c.tier === "tier2").length;
    const tier3 = classifications.filter((c) => c.tier === "tier3").length;
    return { perspective: p, total, tier1, tier2, tier3 };
  });

  const pendingAccounts = classifications.filter((c) => c.status === "agent_proposed");

  return (
    <SectionCard>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.1em] text-muted">
            <th className="px-3 py-2">Perspective</th>
            <th className="px-3 py-2 text-right">Accounts</th>
            <th className="px-3 py-2 text-right">T1 Rule</th>
            <th className="px-3 py-2 text-right">T2 Pattern</th>
            <th className="px-3 py-2 text-right">T3 Agent</th>
          </tr>
        </thead>
        <tbody>
          {perspectiveStats.map((ps) => (
            <tr key={ps.perspective} className="border-b border-border/30">
              <td className="px-3 py-2 font-mono text-foreground">{ps.perspective}</td>
              <td className="px-3 py-2 text-right font-mono text-secondary">{ps.total}</td>
              <td className="px-3 py-2 text-right font-mono text-secondary">{ps.tier1}</td>
              <td className="px-3 py-2 text-right font-mono text-secondary">{ps.tier2}</td>
              <td className="px-3 py-2 text-right font-mono text-secondary">{ps.tier3}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {pendingAccounts.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-xs text-warning font-mono">
            Pending: {pendingAccounts.length} Tier 3 accounts awaiting review
          </p>
          {pendingAccounts.map((a) => (
            <p key={a.accountId} className="text-xs text-muted font-mono pl-4">
              {a.accountCode} &mdash; {a.accountName}
            </p>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

// ── Section 7: Design Decisions ──────────────────────────────────────────────

function DecisionsSection({
  decisions,
}: {
  decisions: { title: string; status: string; recommendation: string }[];
}) {
  const approved = decisions.filter((d) => d.status === "approved").length;
  const pending = decisions.filter((d) => d.status === "pending").length;
  const rejected = decisions.filter((d) => d.status === "rejected").length;

  return (
    <SectionCard>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.1em] text-muted">
            <th className="px-3 py-2 w-8">#</th>
            <th className="px-3 py-2">Decision</th>
            <th className="px-3 py-2 w-28">Status</th>
            <th className="px-3 py-2">Recommendation</th>
          </tr>
        </thead>
        <tbody>
          {decisions.map((d, i) => (
            <tr key={i} className="border-b border-border/30">
              <td className="px-3 py-2 font-mono text-muted">{i + 1}</td>
              <td className="px-3 py-2 text-foreground">{d.title}</td>
              <td className="px-3 py-2">
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider ${
                    d.status === "approved"
                      ? "bg-success/20 text-success"
                      : d.status === "rejected"
                        ? "bg-error/20 text-error"
                        : "bg-warning/20 text-warning"
                  }`}
                >
                  {d.status}
                </span>
              </td>
              <td className="px-3 py-2 text-secondary text-xs">{d.recommendation}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <SummaryLine>
        Summary: {approved} approved &middot; {pending} pending &middot; {rejected} rejected
      </SummaryLine>
    </SectionCard>
  );
}

// ── Section 8: Coverage Matrix ───────────────────────────────────────────────

function CoverageSection() {
  const matrix = getMatrixData();

  return (
    <SectionCard>
      <p className="text-sm text-foreground mb-3 font-mono">
        Coverage: {matrix.coveragePct}% ({matrix.activeCount}/{matrix.totalPossible} active)
        &nbsp;&middot;&nbsp; Unused: {matrix.unusedCount}
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.1em] text-muted">
            <th className="px-3 py-2" />
            {matrix.lobValues.map((lob) => (
              <th key={lob} className="px-3 py-2 text-center">{lob}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.accountTypes.map((at) => (
            <tr key={at} className="border-b border-border/30">
              <td className="px-3 py-2 text-foreground font-medium">{at}</td>
              {matrix.lobValues.map((lob) => {
                const cell = matrix.cells.find(
                  (c) => c.accountType === at && c.lob === lob
                );
                return (
                  <td key={lob} className="px-3 py-2 text-center font-mono text-secondary">
                    {cell?.active ? cell.accountCount : (
                      <span className="text-faint">&mdash;</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </SectionCard>
  );
}

// ── Section 9: Open Items ────────────────────────────────────────────────────

function OpenItemsSection({
  dimensionIssueCount,
  pendingClassifications,
  pendingDecisions,
}: {
  dimensionIssueCount: number;
  pendingClassifications: number;
  pendingDecisions: number;
}) {
  const items: string[] = [];
  if (dimensionIssueCount > 0)
    items.push(`${dimensionIssueCount} dimension issue${dimensionIssueCount > 1 ? "s" : ""} unresolved`);
  if (pendingClassifications > 0)
    items.push(`${pendingClassifications} Tier 3 classification${pendingClassifications > 1 ? "s" : ""} pending review`);
  if (pendingDecisions > 0)
    items.push(`${pendingDecisions} design decision${pendingDecisions > 1 ? "s" : ""} awaiting approval`);

  if (items.length === 0) {
    return (
      <SectionCard>
        <p className="text-sm text-success font-mono">All items resolved.</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard>
      <div className="space-y-2">
        {items.map((item, i) => (
          <p key={i} className="text-sm text-warning font-mono flex items-center gap-2">
            <span className="text-warning">&#9888;</span>
            {item}
          </p>
        ))}
      </div>
    </SectionCard>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function COADeliverable({
  engagementId,
  deliverableId,
  onNavigateToTab,
}: COADeliverableProps) {
  const storeKey = coaStoreKey(engagementId, deliverableId);
  const store = useCOAStore((s) => s.getStore(storeKey));
  const setStatus = useCOAStore((s) => s.setDeliverableStatus);

  const hKey = hierarchyStoreKey(engagementId, deliverableId);
  const hStore = useHierarchyStore((s) => s.getStore(hKey));

  // Compute readiness for all 9 sections
  const sectionReadiness = useMemo((): SectionReadiness[] => {
    if (!store) return Array(9).fill({ status: "blocking", label: "No data" });

    const openIssueCount = store.dimensions.reduce(
      (sum, d) =>
        sum +
        d.issues.filter((i) => i.status === "open" || i.status === "in_progress").length,
      0
    );

    const pendingDecisions = store.decisions.filter(
      (d) => d.status === "pending"
    ).length;

    const pendingClassifications = hStore
      ? hStore.classifications.filter((c) => c.status === "agent_proposed").length
      : 0;

    return [
      // 1. Executive Summary
      store.summary
        ? { status: "ready", label: "Ready" }
        : { status: "blocking", label: "Empty" },
      // 2. Account String — always ready (static data)
      { status: "ready", label: "Ready" },
      // 3. Code Blocks
      store.code_blocks.length > 0
        ? { status: "ready", label: "Ready" }
        : { status: "blocking", label: "No rows" },
      // 4. Account Groups
      store.account_groups.length > 0
        ? { status: "ready", label: "Ready" }
        : { status: "blocking", label: "No rows" },
      // 5. Dimensions
      store.dimensions.length === 0
        ? { status: "blocking", label: "No dimensions" }
        : openIssueCount > 0
          ? { status: "warning", label: `${openIssueCount} open` }
          : { status: "ready", label: "Ready" },
      // 6. FSLI Hierarchy
      !hStore
        ? { status: "blocking", label: "Not seeded" }
        : pendingClassifications > 0
          ? { status: "warning", label: `${pendingClassifications} pending` }
          : { status: "ready", label: "Ready" },
      // 7. Design Decisions
      store.decisions.length === 0
        ? { status: "blocking", label: "No decisions" }
        : pendingDecisions > 0
          ? { status: "warning", label: `${pendingDecisions} pending` }
          : { status: "ready", label: "Ready" },
      // 8. Coverage Matrix — always ready (static data)
      { status: "ready", label: "Ready" },
      // 9. Open Items
      openIssueCount + pendingClassifications + pendingDecisions > 0
        ? {
            status: "warning",
            label: `${openIssueCount + pendingClassifications + pendingDecisions} items`,
          }
        : { status: "ready", label: "Ready" },
    ];
  }, [store, hStore]);

  if (!store) return null;

  const readyCount = sectionReadiness.filter((s) => s.status === "ready").length;

  const openIssueCount = store.dimensions.reduce(
    (sum, d) =>
      sum + d.issues.filter((i) => i.status === "open" || i.status === "in_progress").length,
    0
  );
  const pendingDecisions = store.decisions.filter((d) => d.status === "pending").length;
  const pendingClassifications = hStore
    ? hStore.classifications.filter((c) => c.status === "agent_proposed").length
    : 0;

  const sections: {
    title: string;
    editTab?: TabId;
  }[] = [
    { title: "Executive Summary" },
    { title: "Code Block Dimensions", editTab: "account_string" },
    { title: "Code Block Structure", editTab: "code_blocks" },
    { title: "Account Group Taxonomy", editTab: "account_groups" },
    { title: "Dimension Design", editTab: "dimensions" },
    { title: "FSLI Hierarchy Mapping", editTab: "hierarchy" },
    { title: "Design Decisions Log", editTab: "decisions" },
    { title: "Coverage Analysis", editTab: "dim_matrix" },
    { title: "Open Items & Risks" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Status Bar */}
      <DeliverableStatusBar
        readyCount={readyCount}
        totalSections={9}
        status={store.deliverableStatus}
        modifiedAt={store.modifiedAt}
        onStatusChange={(s) => setStatus(storeKey, s)}
      />

      {/* Sections */}
      {sections.map((section, i) => (
        <div key={i}>
          <SectionHeader
            number={i + 1}
            title={section.title}
            readiness={sectionReadiness[i]}
            editTab={section.editTab}
            onEdit={onNavigateToTab}
          />
          {i === 0 && <ExecSummarySection summary={store.summary} />}
          {i === 1 && <AccountStringSection />}
          {i === 2 && <CodeBlocksSection blocks={store.code_blocks} />}
          {i === 3 && <AccountGroupsSection groups={store.account_groups} />}
          {i === 4 && (
            <DimensionsSection
              dimensions={store.dimensions}
              openIssueCount={openIssueCount}
            />
          )}
          {i === 5 && (
            <HierarchySection
              engagementId={engagementId}
              deliverableId={deliverableId}
            />
          )}
          {i === 6 && <DecisionsSection decisions={store.decisions} />}
          {i === 7 && <CoverageSection />}
          {i === 8 && (
            <OpenItemsSection
              dimensionIssueCount={openIssueCount}
              pendingClassifications={pendingClassifications}
              pendingDecisions={pendingDecisions}
            />
          )}
        </div>
      ))}
    </div>
  );
}
