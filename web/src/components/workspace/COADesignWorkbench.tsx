"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useCOAStore,
  coaStoreKey,
  type COACodeBlock,
  type COAAccountGroup,
  type COADimension,
  type COADecision,
  type DecisionStatus,
} from "@/lib/coa-store";

// ── Types ────────────────────────────────────────────────────────────────────

type TabId = "code_blocks" | "account_groups" | "dimensions" | "decisions";

interface Tab {
  id: TabId;
  label: string;
  badge?: number;
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
        className={`cursor-pointer hover:bg-slate-700/50 px-1 -mx-1 rounded transition-colors ${
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
      className={`bg-slate-700 border border-slate-500 rounded px-1 py-0.5 text-sm text-slate-200 font-mono focus:border-blue-500 focus:outline-none ${
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
        <span className="text-emerald-400">&#10003;</span>
      ) : (
        <span className="text-slate-500">&mdash;</span>
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
          <tr className="border-b border-slate-700 text-left text-[10px] uppercase tracking-[0.1em] text-slate-400">
            <th className="px-3 py-2 w-[100px]">Range</th>
            <th className="px-3 py-2 w-[160px]">Account Type</th>
            <th className="px-3 py-2 w-[200px]">NAIC Alignment</th>
            <th className="px-3 py-2 w-[100px] text-right">Count</th>
            <th className="px-3 py-2">Notes</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((cb) => (
            <tr
              key={cb.id}
              className="border-b border-slate-800 hover:bg-slate-700/30 transition-colors"
            >
              <td className="px-3 py-2 font-mono text-slate-200">
                <EditableCell
                  value={cb.range}
                  onSave={(v) => update(storeKey, cb.id, { range: v })}
                />
              </td>
              <td className="px-3 py-2 text-slate-300">
                <EditableCell
                  value={cb.account_type}
                  onSave={(v) => update(storeKey, cb.id, { account_type: v })}
                />
              </td>
              <td className="px-3 py-2 text-slate-300">
                <EditableCell
                  value={cb.naic_alignment}
                  onSave={(v) => update(storeKey, cb.id, { naic_alignment: v })}
                />
              </td>
              <td className="px-3 py-2 text-right font-mono text-slate-300">
                <EditableCell
                  value={cb.count}
                  numeric
                  onSave={(v) =>
                    update(storeKey, cb.id, { count: parseInt(v) || 0 })
                  }
                />
              </td>
              <td className="px-3 py-2 text-slate-400">
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
        className="mt-3 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 border border-dashed border-slate-600 hover:border-slate-400 rounded transition-colors"
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
          <tr className="border-b border-slate-700 text-left text-[10px] uppercase tracking-[0.1em] text-slate-400">
            <th className="px-3 py-2 w-[100px]">Code</th>
            <th className="px-3 py-2 w-[200px]">Name</th>
            <th className="px-3 py-2 w-[200px]">NAIC Schedule Line</th>
            <th className="px-3 py-2 w-[100px] text-right">Accounts</th>
            <th className="px-3 py-2">Notes</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((ag) => (
            <tr
              key={ag.id}
              className="border-b border-slate-800 hover:bg-slate-700/30 transition-colors"
            >
              <td className="px-3 py-2 font-mono text-slate-200">
                <EditableCell
                  value={ag.group_code}
                  onSave={(v) =>
                    update(storeKey, ag.id, { group_code: v })
                  }
                />
              </td>
              <td className="px-3 py-2 text-slate-300">
                <EditableCell
                  value={ag.name}
                  onSave={(v) => update(storeKey, ag.id, { name: v })}
                />
              </td>
              <td className="px-3 py-2 text-slate-300">
                <EditableCell
                  value={ag.naic_schedule_line}
                  onSave={(v) =>
                    update(storeKey, ag.id, { naic_schedule_line: v })
                  }
                />
              </td>
              <td className="px-3 py-2 text-right font-mono text-slate-300">
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
              <td className="px-3 py-2 text-slate-400">
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
        className="mt-3 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 border border-dashed border-slate-600 hover:border-slate-400 rounded transition-colors"
      >
        + Add Row
      </button>
    </div>
  );
}

// ── Dimensions Tab ───────────────────────────────────────────────────────────

function DimensionsTab({
  storeKey,
  dimensions,
}: {
  storeKey: string;
  dimensions: COADimension[];
}) {
  const update = useCOAStore((s) => s.updateDimension);
  const add = useCOAStore((s) => s.addDimension);

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700 text-left text-[10px] uppercase tracking-[0.1em] text-slate-400">
            <th className="px-3 py-2 w-[150px]">Dimension</th>
            <th className="px-3 py-2 w-[90px] text-right">Fill Rate</th>
            <th className="px-3 py-2 w-[80px] text-right">Values</th>
            <th className="px-3 py-2 w-[80px] text-center">Required</th>
            <th className="px-3 py-2 w-[180px]">Key Values</th>
            <th className="px-3 py-2">Reporting Purpose</th>
            <th className="px-3 py-2 w-[180px]">Issues</th>
          </tr>
        </thead>
        <tbody>
          {dimensions.map((dim) => (
            <tr
              key={dim.id}
              className="border-b border-slate-800 hover:bg-slate-700/30 transition-colors"
            >
              <td className="px-3 py-2 font-mono text-slate-200">
                <EditableCell
                  value={dim.dimension}
                  onSave={(v) =>
                    update(storeKey, dim.id, { dimension: v })
                  }
                />
              </td>
              <td className="px-3 py-2 text-right font-mono text-slate-300">
                <EditableCell
                  value={dim.fill_rate}
                  numeric
                  onSave={(v) =>
                    update(storeKey, dim.id, {
                      fill_rate: parseFloat(v) || 0,
                    })
                  }
                />
                <span className="text-slate-500">%</span>
              </td>
              <td className="px-3 py-2 text-right font-mono text-slate-300">
                <EditableCell
                  value={dim.unique_values}
                  numeric
                  onSave={(v) =>
                    update(storeKey, dim.id, {
                      unique_values: parseInt(v) || 0,
                    })
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
              <td className="px-3 py-2 text-slate-300 font-mono text-xs">
                <EditableCell
                  value={dim.key_values}
                  onSave={(v) =>
                    update(storeKey, dim.id, { key_values: v })
                  }
                />
              </td>
              <td className="px-3 py-2 text-slate-300">
                <EditableCell
                  value={dim.reporting_purpose}
                  wide
                  onSave={(v) =>
                    update(storeKey, dim.id, { reporting_purpose: v })
                  }
                />
              </td>
              <td className="px-3 py-2 text-slate-400">
                <EditableCell
                  value={dim.issues}
                  wide
                  onSave={(v) =>
                    update(storeKey, dim.id, { issues: v })
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={() => add(storeKey)}
        className="mt-3 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 border border-dashed border-slate-600 hover:border-slate-400 rounded transition-colors"
      >
        + Add Row
      </button>
    </div>
  );
}

// ── Decision Card ────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<DecisionStatus, { border: string; badge: string; label: string }> = {
  pending: {
    border: "border-l-amber-500",
    badge: "bg-amber-500/20 text-amber-400",
    label: "PENDING",
  },
  approved: {
    border: "border-l-emerald-500",
    badge: "bg-emerald-500/20 text-emerald-400",
    label: "APPROVED",
  },
  rejected: {
    border: "border-l-red-500",
    badge: "bg-red-500/20 text-red-400",
    label: "REJECTED",
  },
};

function DecisionCard({
  decision,
  storeKey,
}: {
  decision: COADecision;
  storeKey: string;
}) {
  const update = useCOAStore((s) => s.updateDecision);
  const style = STATUS_STYLES[decision.status];

  return (
    <div
      className={`border-l-4 ${style.border} rounded-r-lg bg-slate-800/80 p-4 space-y-3`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-100">
            {decision.title}
          </span>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${style.badge}`}
        >
          {style.label}
        </span>
      </div>

      {/* Content fields */}
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-[10px] uppercase tracking-[0.1em] text-slate-500">
            Context
          </span>
          <p className="text-slate-300 mt-0.5">{decision.context}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-[0.1em] text-slate-500">
            Recommendation
          </span>
          <p className="text-slate-200 mt-0.5">{decision.recommendation}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-[0.1em] text-slate-500">
            Alternative
          </span>
          <p className="text-slate-400 mt-0.5">{decision.alternative}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-[0.1em] text-slate-500">
            Impact
          </span>
          <p className="text-slate-400 mt-0.5">{decision.impact}</p>
        </div>
      </div>

      {/* Consultant notes */}
      <div>
        <span className="text-[10px] uppercase tracking-[0.1em] text-slate-500">
          Consultant Notes
        </span>
        <textarea
          value={decision.consultant_notes}
          onChange={(e) =>
            update(storeKey, decision.id, {
              consultant_notes: e.target.value,
            })
          }
          placeholder="Add your notes..."
          rows={2}
          className="mt-1 w-full rounded border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() =>
            update(storeKey, decision.id, { status: "approved" })
          }
          disabled={decision.status === "approved"}
          className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 disabled:opacity-30 disabled:cursor-default"
        >
          &#10003; Approve
        </button>
        <button
          onClick={() =>
            update(storeKey, decision.id, { status: "rejected" })
          }
          disabled={decision.status === "rejected"}
          className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors bg-red-600/20 text-red-400 hover:bg-red-600/30 disabled:opacity-30 disabled:cursor-default"
        >
          &#10007; Reject
        </button>
        {decision.status !== "pending" && (
          <button
            onClick={() =>
              update(storeKey, decision.id, { status: "pending" })
            }
            className="rounded px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
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
        <p className="text-sm text-slate-500 py-8 text-center">
          No design decisions recorded yet.
        </p>
      )}
    </div>
  );
}

// ── Agent Chat Panel ─────────────────────────────────────────────────────────

function AgentChatPanel({
  storeKey,
  activeTab,
}: {
  storeKey: string;
  activeTab: TabId;
}) {
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const messages = useCOAStore(
    (s) => s.getStore(storeKey)?.chatMessages[activeTab] ?? []
  );
  const addMessage = useCOAStore((s) => s.addChatMessage);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = useCallback(() => {
    const msg = input.trim();
    if (!msg) return;
    setInput("");
    addMessage(storeKey, activeTab, { role: "user", content: msg });
    // Mock agent response — in production this would stream from /api/v1/stream
    setTimeout(() => {
      addMessage(storeKey, activeTab, {
        role: "assistant",
        content:
          "I can help with that. Connect the backend to get live responses from the GL Design Coach.",
      });
    }, 800);
  }, [input, storeKey, activeTab, addMessage]);

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="shrink-0 w-10 flex flex-col items-center justify-center border-l border-slate-700 bg-slate-900 hover:bg-slate-800 transition-colors"
        title="Open agent chat"
      >
        <svg
          className="w-4 h-4 text-slate-400"
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
    <div className="shrink-0 w-[280px] border-l border-slate-700 bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700">
        <span className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-medium">
          Agent Chat
        </span>
        <button
          onClick={() => setExpanded(false)}
          className="text-slate-500 hover:text-slate-300 transition-colors"
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
          <p className="text-xs text-slate-500 text-center py-4">
            Ask the GL Design Coach about this tab.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded px-2.5 py-1.5 text-xs leading-relaxed ${
              m.role === "user"
                ? "bg-slate-700 text-slate-200 ml-4"
                : "bg-slate-800 text-slate-300 mr-4"
            }`}
          >
            {m.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-slate-700 p-2">
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
            placeholder="Ask about this section..."
            className="flex-1 rounded border border-slate-600 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="rounded bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-40 transition-colors"
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
  const toggleSummary = useCOAStore((s) => s.toggleSummaryCollapsed);
  const clearStore = useCOAStore((s) => s.clearStore);

  const [activeTab, setActiveTab] = useState<TabId>("code_blocks");
  const [confirmReseed, setConfirmReseed] = useState(false);

  if (!store) return null;

  const pendingCount = store.decisions.filter(
    (d) => d.status === "pending"
  ).length;

  const tabs: Tab[] = [
    { id: "code_blocks", label: "Code Blocks" },
    { id: "account_groups", label: "Account Groups" },
    { id: "dimensions", label: "Dimensions" },
    {
      id: "decisions",
      label: "Decisions",
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
  ];

  const handleReseed = () => {
    clearStore(storeKey);
    setConfirmReseed(false);
    onReseed();
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
      {/* Agent Summary Banner */}
      <div className="shrink-0 mx-5 mt-4">
        <div className="rounded-lg bg-slate-700/50 border border-slate-600/50">
          <button
            onClick={() => toggleSummary(storeKey)}
            className="w-full flex items-center justify-between px-4 py-2.5"
          >
            <span className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-medium">
              Agent Summary
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-slate-500">
                Seeded{" "}
                {store.seededAt
                  ? new Date(store.seededAt).toLocaleDateString()
                  : ""}
                {store.modifiedAt &&
                  store.modifiedAt !== store.seededAt &&
                  ` · Modified ${new Date(
                    store.modifiedAt
                  ).toLocaleDateString()}`}
              </span>
              <svg
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  store.summaryCollapsed ? "" : "rotate-180"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            </div>
          </button>
          <AnimatePresence>
            {!store.summaryCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="px-4 pb-3 text-sm text-slate-300 font-mono leading-relaxed">
                  {store.summary}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content area with optional chat panel */}
      <div className="flex flex-1 min-h-0 overflow-hidden mt-3">
        {/* Main content */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Tab bar */}
          <div className="shrink-0 flex items-center border-b border-slate-700 px-5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="flex items-center gap-2">
                  {tab.label}
                  {tab.badge !== undefined && (
                    <span className="inline-flex items-center justify-center h-4 min-w-[16px] rounded-full bg-amber-500/20 px-1 text-[10px] font-mono text-amber-400">
                      {tab.badge}
                    </span>
                  )}
                </span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="coa-tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
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
              />
            )}
            {activeTab === "decisions" && (
              <DecisionsTab storeKey={storeKey} decisions={store.decisions} />
            )}
          </div>

          {/* Bottom bar: Re-seed */}
          <div className="shrink-0 border-t border-slate-700/50 px-5 py-2.5 flex items-center justify-end">
            {confirmReseed ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-amber-400">
                  This will discard all manual edits. Continue?
                </span>
                <button
                  onClick={handleReseed}
                  className="rounded bg-amber-600/20 px-3 py-1 text-xs font-medium text-amber-400 hover:bg-amber-600/30 transition-colors"
                >
                  Yes, re-seed
                </button>
                <button
                  onClick={() => setConfirmReseed(false)}
                  className="rounded px-3 py-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReseed(true)}
                className="flex items-center gap-1.5 rounded border border-slate-600 px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors"
              >
                Re-seed &#8635;
              </button>
            )}
          </div>
        </div>

        {/* Chat panel */}
        <AgentChatPanel storeKey={storeKey} activeTab={activeTab} />
      </div>
    </div>
  );
}
