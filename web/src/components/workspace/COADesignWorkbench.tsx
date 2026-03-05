"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fragment } from "react";
import {
  useCOAStore,
  coaStoreKey,
  type COACodeBlock,
  type COAAccountGroup,
  type COADimension,
  type COADecision,
  type COADecisionOption,
  type COAIssue,
  type IssueStatus,
  type DecisionStatus,
  type TabId,
} from "@/lib/coa-store";
import { streamChat, buildWorkbenchContext } from "@/lib/chat-client";
import { useHierarchyStore, hierarchyStoreKey } from "@/lib/hierarchy-store";
import { AccountStringDiagram } from "./coa-tabs/AccountStringDiagram";
import { DimensionalMatrix } from "./coa-tabs/DimensionalMatrix";
import { DynamicHierarchy } from "./coa-tabs/DynamicHierarchy";
import { COADeliverable } from "./coa-tabs/COADeliverable";

// ── Types ────────────────────────────────────────────────────────────────────

interface Tab {
  id: TabId;
  label: string;
  badge?: number;
  dividerBefore?: boolean;
}

interface COADesignWorkbenchProps {
  engagementId: string;
  deliverableId: string;
  onReseed: () => void;
}

// ── Editable Cell ────────────────────────────────────────────────────────────

function EditableCell({
  value,
  onSave,
  numeric,
  wide,
}: {
  value: string | number;
  onSave: (val: string) => void;
  numeric?: boolean;
  wide?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  if (!editing) {
    return (
      <span
        className={`cursor-pointer hover:bg-surface-alt/50 px-1 -mx-1 rounded transition-colors ${
          wide ? "block" : "inline-block"
        }`}
        onClick={() => {
          setDraft(String(value));
          setEditing(true);
        }}
      >
        {numeric ? Number(value).toLocaleString() : String(value) || "\u00A0"}
      </span>
    );
  }

  return (
    <input
      ref={inputRef}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onSave(draft);
          setEditing(false);
        }
        if (e.key === "Escape") {
          setEditing(false);
        }
      }}
      onBlur={() => {
        onSave(draft);
        setEditing(false);
      }}
      className={`bg-surface-alt border border-border-strong rounded px-1 py-0.5 text-sm text-foreground font-mono focus:border-accent focus:outline-none ${
        wide ? "w-full" : "w-auto"
      }`}
      type={numeric ? "number" : "text"}
    />
  );
}

// ── Toggle ───────────────────────────────────────────────────────────────────

function MandatoryToggle({
  value,
  onToggle,
}: {
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="text-sm transition-colors"
      title={value ? "Mandatory" : "Optional"}
    >
      {value ? (
        <span className="text-success">&#10003;</span>
      ) : (
        <span className="text-faint">&mdash;</span>
      )}
    </button>
  );
}

// ── Code Blocks Tab ──────────────────────────────────────────────────────────

function CodeBlocksTab({
  storeKey,
  blocks,
}: {
  storeKey: string;
  blocks: COACodeBlock[];
}) {
  const update = useCOAStore((s) => s.updateCodeBlock);
  const add = useCOAStore((s) => s.addCodeBlock);

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.1em] text-muted">
            <th className="px-3 py-2 w-[100px]">Range</th>
            <th className="px-3 py-2 w-[160px]">Account Type</th>
            <th className="px-3 py-2 w-[200px]">STAT Alignment</th>
            <th className="px-3 py-2 w-[100px] text-right">Count</th>
            <th className="px-3 py-2">Notes</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((cb) => (
            <tr
              key={cb.id}
              className="border-b border-border/30 hover:bg-surface-alt/30 transition-colors"
            >
              <td className="px-3 py-2 font-mono text-foreground">
                <EditableCell
                  value={cb.range}
                  onSave={(v) => update(storeKey, cb.id, { range: v })}
                />
              </td>
              <td className="px-3 py-2 text-secondary">
                <EditableCell
                  value={cb.account_type}
                  onSave={(v) => update(storeKey, cb.id, { account_type: v })}
                />
              </td>
              <td className="px-3 py-2 text-secondary">
                <EditableCell
                  value={cb.stat_alignment}
                  onSave={(v) => update(storeKey, cb.id, { stat_alignment: v })}
                />
              </td>
              <td className="px-3 py-2 text-right font-mono text-secondary">
                <EditableCell
                  value={cb.count}
                  numeric
                  onSave={(v) =>
                    update(storeKey, cb.id, { count: parseInt(v) || 0 })
                  }
                />
              </td>
              <td className="px-3 py-2 text-muted">
                <EditableCell
                  value={cb.notes}
                  wide
                  onSave={(v) => update(storeKey, cb.id, { notes: v })}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={() => add(storeKey)}
        className="mt-3 px-3 py-1.5 text-xs text-muted hover:text-foreground border border-dashed border-border hover:border-secondary rounded transition-colors"
      >
        + Add Row
      </button>
    </div>
  );
}

// ── Account Groups Tab ───────────────────────────────────────────────────────

function AccountGroupsTab({
  storeKey,
  groups,
}: {
  storeKey: string;
  groups: COAAccountGroup[];
}) {
  const update = useCOAStore((s) => s.updateAccountGroup);
  const add = useCOAStore((s) => s.addAccountGroup);

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.1em] text-muted">
            <th className="px-3 py-2 w-[100px]">Code</th>
            <th className="px-3 py-2 w-[200px]">Name</th>
            <th className="px-3 py-2 w-[200px]">Statutory Schedule Line</th>
            <th className="px-3 py-2 w-[100px] text-right">Accounts</th>
            <th className="px-3 py-2">Notes</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((ag) => (
            <tr
              key={ag.id}
              className="border-b border-border/30 hover:bg-surface-alt/30 transition-colors"
            >
              <td className="px-3 py-2 font-mono text-foreground">
                <EditableCell
                  value={ag.group_code}
                  onSave={(v) =>
                    update(storeKey, ag.id, { group_code: v })
                  }
                />
              </td>
              <td className="px-3 py-2 text-secondary">
                <EditableCell
                  value={ag.name}
                  onSave={(v) => update(storeKey, ag.id, { name: v })}
                />
              </td>
              <td className="px-3 py-2 text-secondary">
                <EditableCell
                  value={ag.stat_schedule_line}
                  onSave={(v) =>
                    update(storeKey, ag.id, { stat_schedule_line: v })
                  }
                />
              </td>
              <td className="px-3 py-2 text-right font-mono text-secondary">
                <EditableCell
                  value={ag.account_count}
                  numeric
                  onSave={(v) =>
                    update(storeKey, ag.id, {
                      account_count: parseInt(v) || 0,
                    })
                  }
                />
              </td>
              <td className="px-3 py-2 text-muted">
                <EditableCell
                  value={ag.notes}
                  wide
                  onSave={(v) => update(storeKey, ag.id, { notes: v })}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={() => add(storeKey)}
        className="mt-3 px-3 py-1.5 text-xs text-muted hover:text-foreground border border-dashed border-border hover:border-secondary rounded transition-colors"
      >
        + Add Row
      </button>
    </div>
  );
}

// ── Issue Status Styles ──────────────────────────────────────────────────────

const ISSUE_STATUS_STYLES: Record<IssueStatus, { border: string; badge: string; label: string }> = {
  open: {
    border: "border-l-warning",
    badge: "bg-warning/20 text-warning",
    label: "OPEN",
  },
  in_progress: {
    border: "border-l-accent",
    badge: "bg-accent/20 text-accent",
    label: "IN PROGRESS",
  },
  resolved: {
    border: "border-l-success",
    badge: "bg-success/20 text-success",
    label: "RESOLVED",
  },
  deferred: {
    border: "border-l-border-strong",
    badge: "bg-border-strong/20 text-muted",
    label: "DEFERRED",
  },
};

// ── Issue Summary Badge ─────────────────────────────────────────────────────

function IssueSummaryBadge({
  issues,
  expanded,
  onToggle,
}: {
  issues: COAIssue[];
  expanded: boolean;
  onToggle: () => void;
}) {
  if (issues.length === 0) {
    return <span className="text-faint">&mdash;</span>;
  }

  const openCount = issues.filter((i) => i.status === "open" || i.status === "in_progress").length;
  const allResolved = openCount === 0;

  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider transition-colors ${
        allResolved
          ? "bg-success/20 text-success hover:bg-success/30"
          : "bg-warning/20 text-warning hover:bg-warning/30"
      }`}
    >
      <svg
        className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
      </svg>
      {allResolved
        ? `${issues.length} resolved`
        : `${openCount} open`}
    </button>
  );
}

// ── Issue Card ──────────────────────────────────────────────────────────────

function IssueCard({
  issue,
  storeKey,
  dimId,
  onShowExamples,
}: {
  issue: COAIssue;
  storeKey: string;
  dimId: string;
  onShowExamples?: (issueTitle: string) => void;
}) {
  const updateIssue = useCOAStore((s) => s.updateIssue);
  const deleteIssue = useCOAStore((s) => s.deleteIssue);
  const style = ISSUE_STATUS_STYLES[issue.status];
  const [editing, setEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(issue.title);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      titleRef.current?.focus();
      titleRef.current?.select();
    }
  }, [editing]);

  const handleStatusChange = (newStatus: IssueStatus) => {
    const updates: Partial<COAIssue> = { status: newStatus };
    if (newStatus === "resolved") {
      updates.resolved_at = new Date().toISOString();
    } else {
      updates.resolved_at = null;
    }
    updateIssue(storeKey, dimId, issue.id, updates);
  };

  return (
    <div className={`border-l-4 ${style.border} rounded-r-lg bg-surface/80 p-3 space-y-2`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              ref={titleRef}
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateIssue(storeKey, dimId, issue.id, { title: titleDraft });
                  setEditing(false);
                }
                if (e.key === "Escape") setEditing(false);
              }}
              onBlur={() => {
                updateIssue(storeKey, dimId, issue.id, { title: titleDraft });
                setEditing(false);
              }}
              className="w-full bg-surface-alt border border-border-strong rounded px-2 py-1 text-sm text-foreground font-mono focus:border-accent focus:outline-none"
            />
          ) : (
            <span
              className="text-sm text-foreground cursor-pointer hover:text-foreground transition-colors"
              onClick={() => {
                setTitleDraft(issue.title);
                setEditing(true);
              }}
            >
              {issue.title || <span className="text-faint italic">Click to add title...</span>}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider ${style.badge}`}>
            {style.label}
          </span>
          <button
            onClick={() => deleteIssue(storeKey, dimId, issue.id)}
            className="text-faint hover:text-error transition-colors"
            title="Delete issue"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Consultant notes */}
      <div>
        <span className="text-[11px] uppercase tracking-[0.1em] text-faint">
          Resolution Notes
        </span>
        <textarea
          value={issue.consultant_notes}
          onChange={(e) =>
            updateIssue(storeKey, dimId, issue.id, {
              consultant_notes: e.target.value,
            })
          }
          placeholder="Add resolution notes, action items..."
          rows={2}
          className="mt-1 w-full rounded border border-border bg-surface-alt/50 px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-accent focus:outline-none resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {onShowExamples && (
          <button
            onClick={() => onShowExamples(issue.title)}
            className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors bg-accent/10 text-accent hover:bg-accent/20 border border-accent/30"
          >
            Show examples
          </button>
        )}
        {issue.status !== "in_progress" && (
          <button
            onClick={() => handleStatusChange("in_progress")}
            className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors bg-accent/20 text-accent hover:bg-accent/30"
          >
            Start Working
          </button>
        )}
        {issue.status !== "resolved" && (
          <button
            onClick={() => handleStatusChange("resolved")}
            className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors bg-success/20 text-success hover:bg-success/30"
          >
            &#10003; Resolve
          </button>
        )}
        {issue.status !== "deferred" && (
          <button
            onClick={() => handleStatusChange("deferred")}
            className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors bg-surface-alt/20 text-muted hover:bg-surface-alt/30"
          >
            Defer
          </button>
        )}
        {issue.status !== "open" && (
          <button
            onClick={() => handleStatusChange("open")}
            className="rounded px-3 py-1.5 text-xs text-muted hover:text-foreground transition-colors"
          >
            Reopen
          </button>
        )}
      </div>
    </div>
  );
}

// ── Dimensions Tab ───────────────────────────────────────────────────────────

function DimensionsTab({
  storeKey,
  dimensions,
  onShowExamples,
}: {
  storeKey: string;
  dimensions: COADimension[];
  onShowExamples?: (issueTitle: string) => void;
}) {
  const update = useCOAStore((s) => s.updateDimension);
  const add = useCOAStore((s) => s.addDimension);
  const addIssue = useCOAStore((s) => s.addIssue);
  const [expandedDims, setExpandedDims] = useState<Set<string>>(new Set());

  const toggleExpand = useCallback((dimId: string) => {
    setExpandedDims((prev) => {
      const next = new Set(prev);
      if (next.has(dimId)) {
        next.delete(dimId);
      } else {
        next.add(dimId);
      }
      return next;
    });
  }, []);

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.1em] text-muted">
            <th className="px-3 py-2 w-[150px]">Dimension</th>
            <th className="px-3 py-2 w-[90px] text-right">Fill Rate</th>
            <th className="px-3 py-2 w-[80px] text-right">Values</th>
            <th className="px-3 py-2 w-[80px] text-center">Required</th>
            <th className="px-3 py-2 w-[180px]">Key Values</th>
            <th className="px-3 py-2">Reporting Purpose</th>
            <th className="px-3 py-2 w-[130px]">Issues</th>
          </tr>
        </thead>
        <tbody>
          {dimensions.map((dim) => (
            <Fragment key={dim.id}>
              <tr className="border-b border-border/30 hover:bg-surface-alt/30 transition-colors">
                <td className="px-3 py-2 font-mono text-foreground">
                  <EditableCell
                    value={dim.dimension}
                    onSave={(v) => update(storeKey, dim.id, { dimension: v })}
                  />
                </td>
                <td className="px-3 py-2 text-right font-mono text-secondary">
                  <EditableCell
                    value={dim.fill_rate}
                    numeric
                    onSave={(v) =>
                      update(storeKey, dim.id, { fill_rate: parseFloat(v) || 0 })
                    }
                  />
                  <span className="text-faint">%</span>
                </td>
                <td className="px-3 py-2 text-right font-mono text-secondary">
                  <EditableCell
                    value={dim.unique_values}
                    numeric
                    onSave={(v) =>
                      update(storeKey, dim.id, { unique_values: parseInt(v) || 0 })
                    }
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <MandatoryToggle
                    value={dim.mandatory}
                    onToggle={() =>
                      update(storeKey, dim.id, { mandatory: !dim.mandatory })
                    }
                  />
                </td>
                <td className="px-3 py-2 text-secondary font-mono text-xs">
                  <EditableCell
                    value={dim.key_values}
                    onSave={(v) => update(storeKey, dim.id, { key_values: v })}
                  />
                </td>
                <td className="px-3 py-2 text-secondary">
                  <EditableCell
                    value={dim.reporting_purpose}
                    wide
                    onSave={(v) => update(storeKey, dim.id, { reporting_purpose: v })}
                  />
                </td>
                <td className="px-3 py-2">
                  <IssueSummaryBadge
                    issues={dim.issues}
                    expanded={expandedDims.has(dim.id)}
                    onToggle={() => toggleExpand(dim.id)}
                  />
                </td>
              </tr>
              {/* Expandable issue sub-row */}
              {expandedDims.has(dim.id) && (
                <tr className="bg-surface/30">
                  <td colSpan={7} className="px-4 py-3">
                    <div className="space-y-3">
                      {dim.issues.map((issue) => (
                        <IssueCard
                          key={issue.id}
                          issue={issue}
                          storeKey={storeKey}
                          dimId={dim.id}
                          onShowExamples={onShowExamples}
                        />
                      ))}
                      <button
                        onClick={() => addIssue(storeKey, dim.id)}
                        className="px-3 py-1.5 text-xs text-muted hover:text-foreground border border-dashed border-border hover:border-secondary rounded transition-colors"
                      >
                        + Add Issue
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
      <button
        onClick={() => add(storeKey)}
        className="mt-3 px-3 py-1.5 text-xs text-muted hover:text-foreground border border-dashed border-border hover:border-secondary rounded transition-colors"
      >
        + Add Row
      </button>
    </div>
  );
}

// ── Decision Status Styles ───────────────────────────────────────────────────

const DECISION_STATUS_STYLES: Record<DecisionStatus, { border: string; badge: string; label: string }> = {
  pending: {
    border: "border-l-warning",
    badge: "bg-warning/20 text-warning",
    label: "PENDING",
  },
  decided: {
    border: "border-l-success",
    badge: "bg-success/20 text-success",
    label: "DECIDED",
  },
  deferred: {
    border: "border-l-border-strong",
    badge: "bg-border-strong/20 text-muted",
    label: "DEFERRED",
  },
};

const EFFORT_STYLES: Record<string, string> = {
  high: "bg-error/15 text-error border-error/30",
  medium: "bg-warning/15 text-warning border-warning/30",
  low: "bg-success/15 text-success border-success/30",
};

// ── Option Card ──────────────────────────────────────────────────────────────

function OptionCard({
  option,
  isSelected,
  onSelect,
}: {
  option: COADecisionOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-lg border p-3 space-y-2 transition-all ${
        isSelected
          ? "border-accent bg-accent/10 ring-1 ring-accent/30"
          : "border-border/50 bg-surface/60 hover:border-border hover:bg-surface/80"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${isSelected ? "text-accent" : "text-foreground"}`}>
          {isSelected && <span className="mr-1.5">&#10003;</span>}
          {option.title}
        </span>
        <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${EFFORT_STYLES[option.effort] ?? EFFORT_STYLES.medium}`}>
          {option.effort}
        </span>
      </div>
      <p className="text-xs text-secondary leading-relaxed">{option.description}</p>
      {option.risk && (
        <p className="text-[11px] text-muted">
          <span className="text-faint uppercase tracking-wider">Risk:</span> {option.risk}
        </p>
      )}
      {option.trade_offs && (
        <p className="text-[11px] text-muted">
          <span className="text-faint uppercase tracking-wider">Trade-offs:</span> {option.trade_offs}
        </p>
      )}
    </button>
  );
}

// ── Decision Card ────────────────────────────────────────────────────────────

function DecisionCard({
  decision,
  storeKey,
}: {
  decision: COADecision;
  storeKey: string;
}) {
  const update = useCOAStore((s) => s.updateDecision);
  const style = DECISION_STATUS_STYLES[decision.status];

  const handleSelectOption = (optionId: string) => {
    update(storeKey, decision.id, {
      selected_option_id: optionId,
      status: "decided",
    });
  };

  return (
    <div className={`border-l-4 ${style.border} rounded-r-lg bg-surface/80 p-4 space-y-3`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-foreground">{decision.title}</span>
        <span className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider ${style.badge}`}>
          {style.label}
        </span>
      </div>

      {/* Context */}
      <p className="text-xs text-secondary">{decision.context}</p>

      {/* Option cards */}
      <div className="space-y-2">
        {decision.options.map((opt) => (
          <OptionCard
            key={opt.id}
            option={opt}
            isSelected={decision.selected_option_id === opt.id}
            onSelect={() => handleSelectOption(opt.id)}
          />
        ))}
      </div>

      {/* Consultant notes */}
      <textarea
        value={decision.consultant_notes}
        onChange={(e) =>
          update(storeKey, decision.id, { consultant_notes: e.target.value })
        }
        placeholder="Add your notes..."
        rows={2}
        className="w-full rounded border border-border bg-surface-alt/50 px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-accent focus:outline-none resize-none"
      />

      {/* Actions */}
      <div className="flex gap-2">
        {decision.status !== "deferred" && (
          <button
            onClick={() => update(storeKey, decision.id, { status: "deferred", selected_option_id: null })}
            className="rounded px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground border border-border hover:border-border-strong transition-colors"
          >
            Defer
          </button>
        )}
        {decision.status !== "pending" && (
          <button
            onClick={() => update(storeKey, decision.id, { status: "pending", selected_option_id: null })}
            className="rounded px-3 py-1.5 text-xs text-muted hover:text-foreground transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

// ── Decisions Tab ────────────────────────────────────────────────────────────

function DecisionsTab({
  storeKey,
  decisions,
}: {
  storeKey: string;
  decisions: COADecision[];
}) {
  return (
    <div className="space-y-4">
      {decisions.map((d) => (
        <DecisionCard key={d.id} decision={d} storeKey={storeKey} />
      ))}
      {decisions.length === 0 && (
        <p className="text-sm text-faint py-8 text-center">
          No design decisions recorded yet.
        </p>
      )}
    </div>
  );
}

// ── Analysis Tab ─────────────────────────────────────────────────────────────

function AnalysisTab({ fullAnalysis }: { fullAnalysis: string }) {
  if (!fullAnalysis) {
    return (
      <p className="text-sm text-faint py-8 text-center">
        No analysis narrative available. Run the agent to generate output.
      </p>
    );
  }
  return (
    <div className="prose prose-invert max-w-none">
      <pre className="whitespace-pre-wrap text-sm text-secondary font-mono leading-relaxed bg-transparent p-0 border-none">
        {fullAnalysis}
      </pre>
    </div>
  );
}

// ── Agent Chat Panel ─────────────────────────────────────────────────────────

function AgentChatPanel({
  storeKey,
  activeTab,
  expanded,
  setExpanded,
  pendingMessage,
  clearPendingMessage,
}: {
  storeKey: string;
  activeTab: TabId;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  pendingMessage?: string;
  clearPendingMessage?: () => void;
}) {
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const streamingMsgIdRef = useRef<string | null>(null);
  const tokenBufferRef = useRef("");
  const abortRef = useRef<AbortController | null>(null);
  const messages = useCOAStore(
    (s) => s.getStore(storeKey)?.chatMessages[activeTab] ?? []
  );
  const store = useCOAStore((s) => s.getStore(storeKey));
  const addMessage = useCOAStore((s) => s.addChatMessage);
  const updateMessage = useCOAStore((s) => s.updateChatMessage);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, messages[messages.length - 1]?.content]);

  // Cancel stream on unmount or tab change
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, [activeTab]);

  const startStream = useCallback(
    (userMessage: string) => {
      // Build context from store state
      const context = store
        ? buildWorkbenchContext(store, activeTab)
        : undefined;

      // Build history from last 10 messages
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Add empty assistant message for streaming
      setIsStreaming(true);
      setActiveTool(null);
      tokenBufferRef.current = "";
      const msgId = addMessage(storeKey, activeTab, {
        role: "assistant",
        content: "",
      });
      streamingMsgIdRef.current = msgId;

      const ctrl = streamChat(
        userMessage,
        { context, history, agent: "gl_design_coach" },
        {
          onToken: (content) => {
            tokenBufferRef.current += content;
            if (streamingMsgIdRef.current) {
              updateMessage(
                storeKey,
                activeTab,
                streamingMsgIdRef.current,
                tokenBufferRef.current,
              );
            }
          },
          onToolCall: (tool, status) => {
            setActiveTool(status === "started" ? tool : null);
          },
          onComplete: () => {
            setIsStreaming(false);
            setActiveTool(null);
            streamingMsgIdRef.current = null;
            abortRef.current = null;
          },
          onError: (message) => {
            setIsStreaming(false);
            setActiveTool(null);
            if (streamingMsgIdRef.current) {
              const current = tokenBufferRef.current;
              updateMessage(
                storeKey,
                activeTab,
                streamingMsgIdRef.current,
                current
                  ? `${current}\n\n[Error: ${message}]`
                  : `[Error: ${message}]`,
              );
            }
            streamingMsgIdRef.current = null;
            abortRef.current = null;
          },
        },
      );
      abortRef.current = ctrl;
    },
    [store, activeTab, messages, storeKey, addMessage, updateMessage],
  );

  // Handle pending message from "Show examples" button
  useEffect(() => {
    if (pendingMessage && expanded && !isStreaming) {
      addMessage(storeKey, activeTab, { role: "user", content: pendingMessage });
      clearPendingMessage?.();
      // Small delay to let the user message render
      setTimeout(() => startStream(pendingMessage), 50);
    }
  }, [pendingMessage, expanded, isStreaming, storeKey, activeTab, addMessage, clearPendingMessage, startStream]);

  const handleSend = useCallback(() => {
    const msg = input.trim();
    if (!msg || isStreaming) return;
    setInput("");
    addMessage(storeKey, activeTab, { role: "user", content: msg });
    startStream(msg);
  }, [input, isStreaming, storeKey, activeTab, addMessage, startStream]);

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="shrink-0 w-10 flex flex-col items-center justify-center border-l border-border bg-background hover:bg-surface transition-colors"
        title="Open agent chat"
      >
        <svg
          className="w-4 h-4 text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
          />
        </svg>
      </button>
    );
  }

  return (
    <div className="shrink-0 w-[280px] border-l border-border bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-[11px] uppercase tracking-[0.1em] text-muted font-medium">
          Agent Chat
        </span>
        <button
          onClick={() => setExpanded(false)}
          className="text-faint hover:text-secondary transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-2">
        {messages.length === 0 && (
          <p className="text-xs text-faint text-center py-4">
            Ask the GL Design Coach about this tab.
          </p>
        )}
        {messages.map((m, idx) => (
          <div
            key={m.id}
            className={`rounded px-2.5 py-1.5 text-xs leading-relaxed whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-surface-alt text-foreground ml-4"
                : "bg-surface text-secondary mr-4"
            }`}
          >
            {m.content}
            {/* Blinking cursor on streaming message */}
            {isStreaming &&
              m.role === "assistant" &&
              idx === messages.length - 1 && (
                <span className="inline-block w-1.5 h-3.5 bg-accent/80 ml-0.5 animate-pulse align-text-bottom" />
              )}
          </div>
        ))}
        {/* Tool activity indicator */}
        {activeTool && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-accent font-mono">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            {activeTool}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border p-2">
        <div className="flex gap-1.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isStreaming ? "Agent is responding..." : "Ask about this section..."}
            disabled={isStreaming}
            className="flex-1 rounded border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground placeholder:text-faint focus:border-accent focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="rounded bg-accent px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent/80 disabled:opacity-40 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Workbench ───────────────────────────────────────────────────────────

export function COADesignWorkbench({
  engagementId,
  deliverableId,
  onReseed,
}: COADesignWorkbenchProps) {
  const storeKey = coaStoreKey(engagementId, deliverableId);
  const store = useCOAStore((s) => s.getStore(storeKey));
  const clearStore = useCOAStore((s) => s.clearStore);

  const hKey = hierarchyStoreKey(engagementId, deliverableId);
  const hStore = useHierarchyStore((s) => s.getStore(hKey));

  const [activeTab, setActiveTab] = useState<TabId>("code_blocks");
  const [confirmReseed, setConfirmReseed] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [pendingChatMessage, setPendingChatMessage] = useState<string | undefined>();

  if (!store) return null;

  const pendingCount = store.decisions.filter(
    (d) => d.status === "pending"
  ).length;

  const openIssueCount = store.dimensions.reduce(
    (sum, d) => sum + d.issues.filter((i) => i.status === "open" || i.status === "in_progress").length,
    0
  );

  // Compute deliverable readiness for tab badge
  const deliverableReadySections = (() => {
    let ready = 0;
    const total = 9;
    if (store.summary) ready++;
    ready++; // Account string
    if (store.code_blocks.length > 0) ready++;
    if (store.account_groups.length > 0) ready++;
    if (store.dimensions.length > 0 && openIssueCount === 0) ready++;
    const pendingClassifications = hStore
      ? hStore.classifications.filter((c) => c.status === "agent_proposed").length
      : 0;
    if (hStore && pendingClassifications === 0) ready++;
    if (store.decisions.length > 0 && pendingCount === 0) ready++;
    ready++; // Coverage
    if (openIssueCount + pendingClassifications + pendingCount === 0) ready++;
    return { ready, total };
  })();

  const deliverableAllReady = deliverableReadySections.ready === deliverableReadySections.total;
  const deliverableNonReady = deliverableReadySections.total - deliverableReadySections.ready;

  // "Show examples" handler — opens chat with pre-filled message
  const handleShowExamples = useCallback((issueTitle: string) => {
    setPendingChatMessage(`Show me GL accounts that demonstrate: ${issueTitle}`);
    setChatExpanded(true);
  }, []);

  const tabs: Tab[] = [
    { id: "analysis", label: "Analysis" },
    { id: "code_blocks", label: "Code Blocks", dividerBefore: true },
    { id: "account_groups", label: "Account Groups" },
    {
      id: "dimensions",
      label: "Dimensions",
      badge: openIssueCount > 0 ? openIssueCount : undefined,
    },
    {
      id: "decisions",
      label: "Decisions",
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { id: "account_string", label: "CB Dimensions", dividerBefore: true },
    { id: "dim_matrix", label: "Dim Matrix" },
    { id: "hierarchy", label: "Hierarchy" },
    {
      id: "deliverable",
      label: "Deliverable",
      dividerBefore: true,
      badge: deliverableAllReady ? undefined : deliverableNonReady,
    },
  ];

  const handleReseed = () => {
    clearStore(storeKey);
    setConfirmReseed(false);
    onReseed();
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
      {/* Slim summary banner */}
      <div className="shrink-0 mx-5 mt-3 flex items-center gap-3 px-4 py-2 rounded-lg bg-surface-alt/40 border border-border/30">
        <span className="text-[11px] font-mono text-faint">
          Seeded{" "}
          {store.seededAt ? new Date(store.seededAt).toLocaleDateString() : ""}
          {store.modifiedAt &&
            store.modifiedAt !== store.seededAt &&
            ` · Modified ${new Date(store.modifiedAt).toLocaleDateString()}`}
        </span>
        {store.fullAnalysis && (
          <button
            onClick={() => setActiveTab("analysis")}
            className="text-[11px] font-mono text-accent hover:text-accent/80 transition-colors"
          >
            View analysis &rarr;
          </button>
        )}
      </div>

      {/* Content area with optional chat panel */}
      <div className="flex flex-1 min-h-0 overflow-hidden mt-2">
        {/* Main content */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Tab bar */}
          <div className="shrink-0 flex items-center border-b border-border px-5 overflow-x-auto">
            {tabs.map((tab) => (
              <Fragment key={tab.id}>
                {tab.dividerBefore && (
                  <div className="h-5 w-px bg-border/60 mx-1.5 shrink-0" />
                )}
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-foreground"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {tab.label}
                    {tab.id === "deliverable" && deliverableAllReady ? (
                      <span className="inline-flex items-center justify-center h-4 min-w-[16px] rounded-full bg-success/20 px-1 text-[11px] font-mono text-success">
                        &#10003;
                      </span>
                    ) : tab.badge !== undefined ? (
                      <span className="inline-flex items-center justify-center h-4 min-w-[16px] rounded-full bg-warning/20 px-1 text-[11px] font-mono text-warning">
                        {tab.badge}
                      </span>
                    ) : null}
                  </span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="coa-tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                    />
                  )}
                </button>
              </Fragment>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
            {activeTab === "analysis" && (
              <AnalysisTab fullAnalysis={store.fullAnalysis} />
            )}
            {activeTab === "code_blocks" && (
              <CodeBlocksTab storeKey={storeKey} blocks={store.code_blocks} />
            )}
            {activeTab === "account_groups" && (
              <AccountGroupsTab
                storeKey={storeKey}
                groups={store.account_groups}
              />
            )}
            {activeTab === "dimensions" && (
              <DimensionsTab
                storeKey={storeKey}
                dimensions={store.dimensions}
                onShowExamples={handleShowExamples}
              />
            )}
            {activeTab === "decisions" && (
              <DecisionsTab storeKey={storeKey} decisions={store.decisions} />
            )}
            {activeTab === "account_string" && (
              <AccountStringDiagram
                engagementId={engagementId}
                deliverableId={deliverableId}
                onProposeToAgent={(msg) => {
                  setPendingChatMessage(msg);
                  setChatExpanded(true);
                }}
              />
            )}
            {activeTab === "dim_matrix" && (
              <DimensionalMatrix
                engagementId={engagementId}
                deliverableId={deliverableId}
                onAskAgent={(msg) => {
                  setPendingChatMessage(msg);
                  setChatExpanded(true);
                }}
              />
            )}
            {activeTab === "hierarchy" && (
              <DynamicHierarchy
                engagementId={engagementId}
                deliverableId={deliverableId}
              />
            )}
            {activeTab === "deliverable" && (
              <COADeliverable
                engagementId={engagementId}
                deliverableId={deliverableId}
                onNavigateToTab={setActiveTab}
              />
            )}
          </div>

          {/* Bottom bar: Re-seed */}
          <div className="shrink-0 border-t border-border/50 px-5 py-2.5 flex items-center justify-end">
            {confirmReseed ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-warning">
                  This will discard all manual edits. Continue?
                </span>
                <button
                  onClick={handleReseed}
                  className="rounded bg-warning/20 px-3 py-1 text-xs font-medium text-warning hover:bg-warning/30 transition-colors"
                >
                  Yes, re-seed
                </button>
                <button
                  onClick={() => setConfirmReseed(false)}
                  className="rounded px-3 py-1 text-xs text-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReseed(true)}
                className="flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs font-mono text-muted hover:text-foreground hover:border-border-strong transition-colors"
              >
                Re-seed &#8635;
              </button>
            )}
          </div>
        </div>

        {/* Chat panel — hidden on deliverable and analysis tabs */}
        {activeTab !== "deliverable" && activeTab !== "analysis" && (
          <AgentChatPanel
            storeKey={storeKey}
            activeTab={activeTab}
            expanded={chatExpanded}
            setExpanded={setChatExpanded}
            pendingMessage={pendingChatMessage}
            clearPendingMessage={() => setPendingChatMessage(undefined)}
          />
        )}
      </div>
    </div>
  );
}
