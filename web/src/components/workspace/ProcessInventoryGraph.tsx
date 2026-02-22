"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type {
  ProcessInventoryData,
  ProcessInventoryNode,
  ProcessInventoryErpNotes,
  ProcessSubFlow,
  ProcessScope,
  ProcessWorkStatus,
  AgentLevel,
  AgentPattern,
} from "@/lib/mock-data";
import { useWorkshopStore } from "@/lib/workshop-store";

// ── Agent framework config ─────────────────────────────────────────────────

const LEVEL_CFG: Record<AgentLevel, { color: string; bg: string }> = {
  L0: { color: "#475569", bg: "rgba(71,85,105,0.15)" },
  L1: { color: "#94A3B8", bg: "rgba(148,163,184,0.12)" },
  L2: { color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
  L3: { color: "#A855F7", bg: "rgba(168,85,247,0.12)" },
  L4: { color: "#10B981", bg: "rgba(16,185,129,0.12)" },
};

const WAVE_CFG: Record<1 | 2 | 3 | 4, { color: string; bg: string }> = {
  1: { color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  2: { color: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  3: { color: "#A855F7", bg: "rgba(168,85,247,0.1)" },
  4: { color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
};

const PATTERN_LABEL: Record<AgentPattern, string> = {
  reconciliation:      "Reconciliation",
  posting:             "Posting",
  allocation:          "Allocation",
  document_intelligence: "Doc Intelligence",
  close_orchestration: "Close Orchestration",
  compliance_reporting: "Compliance & Reporting",
};

// ── Config ────────────────────────────────────────────────────────────────

const SCOPE_OPTIONS: { value: ProcessScope; label: string; activeClass: string }[] = [
  { value: "in_scope",    label: "In Scope",    activeClass: "bg-[#475569]/40 text-foreground border-[#475569]/70" },
  { value: "deferred",    label: "Deferred",    activeClass: "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/50" },
  { value: "out_of_scope", label: "Out of Scope", activeClass: "bg-[#EF4444]/10 text-[#EF4444]/80 border-[#EF4444]/40" },
];

const WORK_OPTIONS: { value: ProcessWorkStatus; label: string; activeClass: string }[] = [
  { value: "not_started", label: "Not Started", activeClass: "bg-surface-alt text-muted border-border" },
  { value: "in_progress", label: "In Progress", activeClass: "bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/50" },
  { value: "complete",    label: "Complete",    activeClass: "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/50" },
];

// Dot color: work_status takes precedence over scope for visual feedback
function dotClass(node: ProcessInventoryNode): string {
  if (node.scope === "out_of_scope") return "bg-[#334155]";
  if (node.scope === "deferred")     return "bg-[#475569]";
  if (node.work_status === "complete")    return "bg-[#10B981]";
  if (node.work_status === "in_progress") return "bg-[#3B82F6] agent-thinking";
  return "bg-[#475569]";
}

function nameClass(node: ProcessInventoryNode): string {
  if (node.scope === "out_of_scope") return "text-muted/80 line-through";
  if (node.scope === "deferred")     return "text-muted";
  return "text-foreground";
}

// ── Inline disclosure panels ───────────────────────────────────────────────

function ErpNotesPanel({ notes }: { notes: ProcessInventoryErpNotes }) {
  const entries: { label: string; text: string }[] = [];
  if (notes.sap)     entries.push({ label: "SAP S/4HANA",        text: notes.sap });
  if (notes.oracle)  entries.push({ label: "Oracle Cloud ERP",   text: notes.oracle });
  if (notes.workday) entries.push({ label: "Workday Financials", text: notes.workday });

  return (
    <motion.div
      key="erp"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.15 }}
      className="overflow-hidden"
    >
      <div className="mx-3 mb-1 px-4 py-3 rounded-lg bg-surface/60 border border-border/40 space-y-3">
        <p className="text-[9px] uppercase tracking-[0.12em] text-[#3B82F6] font-semibold">
          ERP Notes
        </p>
        {entries.map(({ label, text }) => (
          <div key={label}>
            <p className="text-[9px] font-semibold text-muted mb-1">{label}</p>
            <p className="text-[11px] text-muted leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ScopingQsPanel({ questions }: { questions: string[] }) {
  return (
    <motion.div
      key="qs"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.15 }}
      className="overflow-hidden"
    >
      <div className="mx-3 mb-1 px-4 py-3 rounded-lg bg-surface/60 border border-border/40">
        <p className="text-[9px] uppercase tracking-[0.12em] text-[#8B5CF6] font-semibold mb-2.5">
          Scoping Questions
        </p>
        <ol className="space-y-2">
          {questions.map((q, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="flex-shrink-0 text-[10px] font-mono text-muted/80 w-4 pt-px">
                {i + 1}.
              </span>
              <span className="text-[11px] text-muted leading-relaxed">{q}</span>
            </li>
          ))}
        </ol>
      </div>
    </motion.div>
  );
}

function SubFlowsPanel({ subFlows }: { subFlows: ProcessSubFlow[] }) {
  const params = useParams<{ engagementId: string }>();

  return (
    <motion.div
      key="flows"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.15 }}
      className="overflow-hidden"
    >
      <div className="mx-3 mb-1 px-4 py-3 rounded-lg bg-surface/60 border border-border/40">
        <p className="text-[9px] uppercase tracking-[0.12em] text-[#10B981] font-semibold mb-2.5">
          Sub-Flows
        </p>
        <div className="space-y-1.5">
          {subFlows.map((sf) => (
            <div key={sf.id} className="flex items-center gap-2.5">
              <span className="flex-shrink-0 text-[9px] font-mono text-muted/80 w-12">{sf.id}</span>
              {sf.deliverable_id ? (
                <Link
                  href={`/${params.engagementId}/deliverables/${sf.deliverable_id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="group flex items-center gap-1.5 text-[11px] text-foreground/80 hover:text-foreground transition-colors"
                >
                  <span className="group-hover:underline underline-offset-2">{sf.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent/10 text-accent group-hover:bg-accent/20 group-hover:text-accent transition-colors font-mono">
                    map ↗
                  </span>
                </Link>
              ) : (
                <span className="text-[11px] text-muted">{sf.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Process row ───────────────────────────────────────────────────────────

function ProcessRow({
  node,
  selected,
  onSelect,
  onScopeChange,
  onWorkStatusChange,
  expandedSection,
  onToggleSection,
}: {
  node: ProcessInventoryNode;
  selected: boolean;
  onSelect: () => void;
  onScopeChange: (s: ProcessScope) => void;
  onWorkStatusChange: (s: ProcessWorkStatus) => void;
  expandedSection: "erp" | "qs" | "flows" | null;
  onToggleSection: (section: "erp" | "qs" | "flows") => void;
}) {
  const hasErp = !!node.erp_notes;
  const hasQs  = !!node.scoping_questions?.length;

  return (
    <div
      onClick={onSelect}
      className={[
        "group flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors",
        selected
          ? "bg-surface border-border/60"
          : "border-transparent hover:bg-surface/50 hover:border-border/30",
      ].join(" ")}
    >
      {/* Dot */}
      <div className="flex-shrink-0 w-3 flex items-center justify-center">
        <div className={`w-2 h-2 rounded-full ${dotClass(node)}`} />
      </div>

      {/* PA ID */}
      {node.pa_id && (
        <span className="flex-shrink-0 text-[9px] font-mono text-muted/80 w-9">
          {node.pa_id}
        </span>
      )}

      {/* Name */}
      <span className={`flex-1 text-[12px] leading-snug ${nameClass(node)}`}>
        {node.name}
      </span>

      {/* Agent wave + level badges */}
      {node.agent_wave && node.agent_level && (() => {
        const wc = WAVE_CFG[node.agent_wave as 1 | 2 | 3 | 4];
        const lc = LEVEL_CFG[node.agent_level];
        return (
          <div className="flex-shrink-0 flex items-center gap-1">
            <span style={{
              fontSize: 8,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              color: wc.color,
              backgroundColor: wc.bg,
              border: `1px solid ${wc.color}30`,
              borderRadius: 3,
              padding: "1px 5px",
              lineHeight: 1.6,
            }}>
              W{node.agent_wave}
            </span>
            <span style={{
              fontSize: 8,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              color: lc.color,
              backgroundColor: lc.bg,
              border: `1px solid ${lc.color}30`,
              borderRadius: 3,
              padding: "1px 5px",
              lineHeight: 1.6,
            }}>
              {node.agent_level}
            </span>
          </div>
        );
      })()}

      {/* Sub-flow count — clickable when sub_flows data exists */}
      {node.sub_flows?.length ? (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSection("flows"); }}
          className={[
            "text-[10px] font-mono flex-shrink-0 mr-1 transition-colors",
            expandedSection === "flows"
              ? "text-[#10B981]"
              : "text-muted hover:text-foreground/90",
          ].join(" ")}
        >
          {node.sub_flow_count} flows {expandedSection === "flows" ? "▲" : "▾"}
        </button>
      ) : (
        <span className="text-[10px] font-mono text-muted flex-shrink-0 mr-1">
          {node.sub_flow_count} flows
        </span>
      )}

      {/* Disclosure buttons */}
      <div
        className="flex-shrink-0 flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        {hasErp && (
          <button
            onClick={() => onToggleSection("erp")}
            className={[
              "text-[9px] px-2 py-0.5 rounded border transition-colors",
              expandedSection === "erp"
                ? "bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/40"
                : "border-border/20 text-muted/70 hover:text-muted hover:border-border/50",
            ].join(" ")}
          >
            ERP {expandedSection === "erp" ? "▲" : "▾"}
          </button>
        )}
        {hasQs && (
          <button
            onClick={() => onToggleSection("qs")}
            className={[
              "text-[9px] px-2 py-0.5 rounded border transition-colors",
              expandedSection === "qs"
                ? "bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/40"
                : "border-border/20 text-muted/70 hover:text-muted hover:border-border/50",
            ].join(" ")}
          >
            Qs {expandedSection === "qs" ? "▲" : "▾"}
          </button>
        )}
      </div>

      {/* Scope toggles */}
      <div
        className="flex-shrink-0 flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        {SCOPE_OPTIONS.map(({ value, label, activeClass }) => (
          <button
            key={value}
            onClick={() => onScopeChange(value)}
            className={[
              "text-[9px] px-2 py-0.5 rounded border transition-colors",
              node.scope === value
                ? activeClass
                : "border-border/20 text-muted/70 hover:text-muted hover:border-border/50",
            ].join(" ")}
          >
            {label === "In Scope" ? "In" : label === "Out of Scope" ? "Out" : "Defer"}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Detail drawer ─────────────────────────────────────────────────────────

function DetailDrawer({
  node,
  onClose,
  onScopeChange,
  onWorkStatusChange,
}: {
  node: ProcessInventoryNode;
  onClose: () => void;
  onScopeChange: (s: ProcessScope) => void;
  onWorkStatusChange: (s: ProcessWorkStatus) => void;
}) {
  return (
    <motion.div
      key="drawer"
      className="absolute top-0 right-0 bottom-0 w-[260px] bg-surface border-l border-border flex flex-col overflow-hidden z-10"
      initial={{ x: 260 }}
      animate={{ x: 0 }}
      exit={{ x: 260 }}
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

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Name + area */}
        <div>
          {node.pa_id && (
            <p className="text-[9px] font-mono text-muted/80 mb-1">{node.pa_id}</p>
          )}
          <p className="text-[13px] font-medium text-foreground leading-snug">
            {node.name}
          </p>
          {node.process_area && (
            <p className="mt-1 text-[10px] text-muted">{node.process_area}</p>
          )}
          <p className="mt-1.5 text-[10px] font-mono text-muted">
            {node.sub_flow_count} sub-flow{node.sub_flow_count !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Description */}
        {node.description && (
          <div>
            <p className="text-[9px] uppercase tracking-[0.1em] text-muted mb-1.5">
              Description
            </p>
            <p className="text-[11px] text-muted leading-relaxed">{node.description}</p>
          </div>
        )}

        {/* Agent framework */}
        {node.agent_wave && node.agent_level && (() => {
          const wc = WAVE_CFG[node.agent_wave as 1 | 2 | 3 | 4];
          const lc = LEVEL_CFG[node.agent_level];
          return (
            <div style={{ borderTop: "1px solid rgba(71,85,105,0.3)", paddingTop: 14 }}>
              <p className="text-[9px] uppercase tracking-[0.1em] text-muted mb-3">
                Agent Framework
              </p>
              <div className="flex gap-1.5 mb-3">
                <span style={{
                  fontSize: 9,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: wc.color,
                  backgroundColor: wc.bg,
                  border: `1px solid ${wc.color}35`,
                  borderRadius: 4,
                  padding: "3px 8px",
                }}>
                  Wave {node.agent_wave}
                </span>
                <span style={{
                  fontSize: 9,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: lc.color,
                  backgroundColor: lc.bg,
                  border: `1px solid ${lc.color}35`,
                  borderRadius: 4,
                  padding: "3px 8px",
                }}>
                  {node.agent_level}
                </span>
                {node.agent_pattern && (
                  <span style={{
                    fontSize: 8.5,
                    color: "#64748B",
                    backgroundColor: "rgba(71,85,105,0.15)",
                    border: "1px solid rgba(71,85,105,0.3)",
                    borderRadius: 4,
                    padding: "3px 8px",
                  }}>
                    {PATTERN_LABEL[node.agent_pattern]}
                  </span>
                )}
              </div>
              {node.agent_opportunity && (
                <div className="mb-2.5">
                  <p className="text-[9px] text-muted/80 mb-1">Opportunity</p>
                  <p className="text-[10.5px] text-muted leading-relaxed">{node.agent_opportunity}</p>
                </div>
              )}
              {node.agent_key_insight && (
                <div
                  style={{
                    backgroundColor: "rgba(59,130,246,0.06)",
                    border: "1px solid rgba(59,130,246,0.2)",
                    borderRadius: 6,
                    padding: "8px 10px",
                  }}
                >
                  <p className="text-[9px] text-[#3B82F6] mb-1">Key Insight</p>
                  <p className="text-[10px] text-muted leading-relaxed">{node.agent_key_insight}</p>
                </div>
              )}
            </div>
          );
        })()}

        {/* Scope */}
        <div>
          <p className="text-[9px] uppercase tracking-[0.1em] text-muted mb-2">
            Scope
          </p>
          <div className="flex flex-col gap-1.5">
            {SCOPE_OPTIONS.map(({ value, label, activeClass }) => {
              const isActive = node.scope === value;
              return (
                <button
                  key={value}
                  onClick={() => onScopeChange(value)}
                  className={[
                    "text-left text-[10px] font-medium px-3 py-2 rounded border transition-colors",
                    isActive
                      ? activeClass
                      : "border-border/30 text-muted/80 hover:text-muted hover:border-border/60",
                  ].join(" ")}
                >
                  {isActive && <span className="mr-1.5 text-[8px]">●</span>}
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Work status */}
        <div>
          <p className="text-[9px] uppercase tracking-[0.1em] text-muted mb-2">
            Status
          </p>
          <div className="flex flex-col gap-1.5">
            {WORK_OPTIONS.map(({ value, label, activeClass }) => {
              const isActive = node.work_status === value;
              return (
                <button
                  key={value}
                  onClick={() => onWorkStatusChange(value)}
                  className={[
                    "text-left text-[10px] font-medium px-3 py-2 rounded border transition-colors",
                    isActive
                      ? activeClass
                      : "border-border/30 text-muted/80 hover:text-muted hover:border-border/60",
                  ].join(" ")}
                >
                  {isActive && <span className="mr-1.5 text-[8px]">●</span>}
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Summary bar ───────────────────────────────────────────────────────────

function SummaryBar({ nodes }: { nodes: ProcessInventoryNode[] }) {
  const inScope    = nodes.filter((n) => n.scope === "in_scope").length;
  const deferred   = nodes.filter((n) => n.scope === "deferred").length;
  const outOfScope = nodes.filter((n) => n.scope === "out_of_scope").length;
  const inProgress = nodes.filter((n) => n.scope === "in_scope" && n.work_status === "in_progress").length;
  const complete   = nodes.filter((n) => n.scope === "in_scope" && n.work_status === "complete").length;
  const wave1      = nodes.filter((n) => n.agent_wave === 1).length;
  const l3plus     = nodes.filter((n) => n.agent_level === "L3" || n.agent_level === "L4").length;

  return (
    <div className="flex items-center gap-4 px-6 py-2.5 border-b border-border/40 text-[10px] flex-wrap">
      <span className="text-muted">{nodes.length} processes</span>
      <span>
        <span className="text-muted mr-1">In scope</span>
        <span className="font-mono text-foreground">{inScope}</span>
      </span>
      {complete > 0 && (
        <span>
          <span className="text-muted mr-1">Complete</span>
          <span className="font-mono text-[#10B981]">{complete}</span>
        </span>
      )}
      {inProgress > 0 && (
        <span>
          <span className="text-muted mr-1">In progress</span>
          <span className="font-mono text-[#3B82F6]">{inProgress}</span>
        </span>
      )}
      {deferred > 0 && (
        <span>
          <span className="text-[#F59E0B] mr-1">Deferred</span>
          <span className="font-mono text-[#F59E0B]">{deferred}</span>
        </span>
      )}
      {outOfScope > 0 && (
        <span>
          <span className="text-[#EF4444] mr-1">Out of scope</span>
          <span className="font-mono text-[#EF4444]">{outOfScope}</span>
        </span>
      )}
      <div className="w-px h-3 bg-border/40" />
      {wave1 > 0 && (
        <span>
          <span className="text-[#10B981] mr-1">Wave 1</span>
          <span className="font-mono text-[#10B981]">{wave1}</span>
        </span>
      )}
      {l3plus > 0 && (
        <span>
          <span className="text-[#A855F7] mr-1">L3+</span>
          <span className="font-mono text-[#A855F7]">{l3plus}</span>
        </span>
      )}
      <div style={{ marginLeft: "auto" }}>
        <Link
          href="/framework"
          className="text-[9px] font-mono text-muted hover:text-foreground transition-colors"
        >
          framework ↗
        </Link>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export function ProcessInventoryGraph({ data }: { data: ProcessInventoryData }) {
  const [allNodes, setAllNodes] = useState<ProcessInventoryNode[]>(data.nodes);
  const [selectedNode, setSelectedNode] = useState<ProcessInventoryNode | null>(null);
  const [expandedSection, setExpandedSection] = useState<{ id: string; section: "erp" | "qs" | "flows" } | null>(null);

  // Workshop filter: show only selected PA when workshop is active
  const workshopMode = useWorkshopStore((s) => s.workshopMode);
  const workshopSession = useWorkshopStore((s) => s.workshopSession);

  const nodes = workshopMode && workshopSession
    ? allNodes.filter((n) => n.pa_id === workshopSession.processAreaId)
    : allNodes;

  const updateNode = (nodeId: string, patch: Partial<ProcessInventoryNode>) => {
    setAllNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, ...patch } : n)));
    setSelectedNode((prev) => (prev?.id === nodeId ? { ...prev, ...patch } : prev));
  };

  const handleToggleSection = (nodeId: string, section: "erp" | "qs" | "flows") => {
    setExpandedSection((prev) =>
      prev?.id === nodeId && prev.section === section ? null : { id: nodeId, section }
    );
  };

  const groups = new Map<string, ProcessInventoryNode[]>();
  for (const node of nodes) {
    const area = node.process_area ?? "Other";
    if (!groups.has(area)) groups.set(area, []);
    groups.get(area)!.push(node);
  }

  return (
    <div className="relative flex flex-col flex-1 min-h-0 overflow-hidden">
      <SummaryBar nodes={nodes} />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="max-w-2xl space-y-5">
            {[...groups].map(([area, areaNodes]) => (
              <div key={area}>
                <h3 className="text-[10px] uppercase tracking-[0.14em] text-muted font-semibold px-3 mb-1.5">
                  {area}
                </h3>
                <div className="space-y-0.5">
                  {areaNodes.map((node) => {
                    const sec = expandedSection?.id === node.id ? expandedSection.section : null;
                    return (
                      <div key={node.id}>
                        <ProcessRow
                          node={node}
                          selected={selectedNode?.id === node.id}
                          onSelect={() =>
                            setSelectedNode((prev) => (prev?.id === node.id ? null : node))
                          }
                          onScopeChange={(s) => updateNode(node.id, { scope: s })}
                          onWorkStatusChange={(s) => updateNode(node.id, { work_status: s })}
                          expandedSection={sec}
                          onToggleSection={(section) => handleToggleSection(node.id, section)}
                        />
                        <AnimatePresence>
                          {sec === "flows" && node.sub_flows?.length && (
                            <SubFlowsPanel subFlows={node.sub_flows} />
                          )}
                          {sec === "erp" && node.erp_notes && (
                            <ErpNotesPanel notes={node.erp_notes} />
                          )}
                          {sec === "qs" && node.scoping_questions?.length && (
                            <ScopingQsPanel questions={node.scoping_questions} />
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {selectedNode && (
            <DetailDrawer
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
              onScopeChange={(s) => updateNode(selectedNode.id, { scope: s })}
              onWorkStatusChange={(s) => updateNode(selectedNode.id, { work_status: s })}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
