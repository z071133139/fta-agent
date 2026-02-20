"use client";

import Link from "next/link";

// ── Data ──────────────────────────────────────────────────────────────────────

const MATURITY_LEVELS = [
  {
    level: "L0",
    name: "Manual",
    color: "#475569",
    bg: "rgba(71,85,105,0.12)",
    border: "rgba(71,85,105,0.4)",
    description: "Spreadsheet-driven, human-executed. No AI involvement. High error rate, limited audit trail.",
    examples: ["Manual journal entry keying", "Excel-based reserve calculations", "Email-driven close task management"],
  },
  {
    level: "L1",
    name: "Copilot",
    color: "#94A3B8",
    bg: "rgba(148,163,184,0.1)",
    border: "rgba(148,163,184,0.35)",
    description: "AI suggests, human decides and executes. Agent drafts, flags, and recommends — human retains control.",
    examples: ["CoA gap analysis with recommendations", "Draft footnote generation for review", "Section 846 calculation assistance"],
  },
  {
    level: "L2",
    name: "Supervised Autopilot",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.35)",
    description: "AI executes, human approves exceptions. Agent handles the routine; humans handle the novel.",
    examples: ["Premium posting from PAS interface", "Investment reconciliation with exception queue", "NAIC schedule data assembly"],
  },
  {
    level: "L3",
    name: "Autonomous Agent",
    color: "#A855F7",
    bg: "rgba(168,85,247,0.1)",
    border: "rgba(168,85,247,0.35)",
    description: "AI executes and monitors with minimal human involvement. Human sets policy, agent manages operations.",
    examples: ["Bank reconciliation 24/7", "Pool settlement and elimination posting", "Close orchestration with exception escalation"],
  },
  {
    level: "L4",
    name: "Orchestrating Agent",
    color: "#10B981",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.35)",
    description: "AI coordinates multiple specialized agents. Meta-agent decomposes complex goals and routes to sub-agents.",
    examples: ["Multi-agent close conductor", "Cross-entity regulatory filing coordinator", "CFO dashboard from 6+ data agents"],
  },
];

const DIMENSIONS = [
  {
    id: "AR",
    name: "Automation Readiness",
    color: "#3B82F6",
    description: "Data structure quality, rule codifiability, process predictability. How amenable is this process to algorithmic execution?",
    hi: "Structured inputs, deterministic rules, high volume",
    lo: "Judgment-intensive, unstructured inputs, one-off decisions",
  },
  {
    id: "AV",
    name: "Agentic Value",
    color: "#10B981",
    description: "Business impact of automating this process. Does agent-level automation unlock material time savings, accuracy gains, or capability not previously possible?",
    hi: "Close-critical, high labor hours, high error cost",
    lo: "Occasional, low-risk, already fast",
  },
  {
    id: "DM",
    name: "Data Maturity",
    color: "#06B6D4",
    description: "Quality, accessibility, and timeliness of source data. An agent is only as good as the data it reasons over.",
    hi: "Clean, structured, API-accessible, real-time",
    lo: "Manual extracts, missing data, reconciliation-heavy",
  },
  {
    id: "RE",
    name: "Risk Exposure",
    color: "#F59E0B",
    description: "Financial, reputational, and operational consequences of agent errors. Higher risk requires more human oversight.",
    hi: "Regulatory impact, restatement risk, material dollars",
    lo: "Reversible, low dollar value, internal only",
  },
  {
    id: "RC",
    name: "Regulatory Constraint",
    color: "#EF4444",
    description: "External compliance requirements that limit autonomous action. Some processes require human sign-off by law.",
    hi: "NAIC exam, SOX, state filing with signature",
    lo: "Internal management reporting, no external obligation",
  },
  {
    id: "TP",
    name: "Total Priority Score",
    color: "#A855F7",
    description: "Composite sequencing signal: TP = (AR + AV + DM) − RE − RC. Drives wave assignment. Positive and high = automate first.",
    hi: "High positive score → Wave 1 target",
    lo: "Negative or low score → defer to later waves",
  },
];

const PATTERNS = [
  {
    id: "reconciliation",
    name: "Reconciliation",
    icon: "⇌",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.25)",
    description: "Agent continuously compares two data sources, identifies breaks, classifies root causes, and resolves or escalates.",
    processes: ["Bank reconciliation", "Sub-ledger to GL", "Intercompany matching", "Investment interface"],
  },
  {
    id: "posting",
    name: "Posting",
    icon: "→",
    color: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.25)",
    description: "Agent receives structured input, applies classification logic, and generates correctly coded journal entries for human approval or direct posting.",
    processes: ["Premium accounting", "Multi-basis GL posting", "Reserve entries", "Accrual generation"],
  },
  {
    id: "allocation",
    name: "Allocation",
    icon: "÷",
    color: "#06B6D4",
    bg: "rgba(6,182,212,0.08)",
    border: "rgba(6,182,212,0.25)",
    description: "Agent applies codified allocation methodology (IEE, profit center, LOB) and produces attribution output with audit trail.",
    processes: ["IEE Exhibit 2", "LOB cost allocation", "Depreciation scheduling", "Expense classification"],
  },
  {
    id: "document_intelligence",
    name: "Document Intelligence",
    icon: "◎",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.25)",
    description: "Agent extracts structured data from semi-structured documents (treaties, statements, invoices) and maps to financial system schema.",
    processes: ["Treaty parsing", "Bordereaux ingestion", "Commission statements", "CoA gap analysis"],
  },
  {
    id: "close_orchestration",
    name: "Close Orchestration",
    icon: "◆",
    color: "#A855F7",
    bg: "rgba(168,85,247,0.08)",
    border: "rgba(168,85,247,0.25)",
    description: "Meta-agent manages 40+ close tasks, dependencies, and exceptions — coordinating sub-agents, escalating blockers, and reporting critical-path status in real time.",
    processes: ["Financial close", "Consolidation sequence", "Multi-entity coordination", "Close analytics"],
  },
  {
    id: "compliance_reporting",
    name: "Compliance & Reporting",
    icon: "▣",
    color: "#EF4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.25)",
    description: "Agent assembles regulatory or management reports from structured data, validates cross-schedule consistency, and drafts narrative disclosures.",
    processes: ["NAIC Annual Statement", "GAAP/IFRS reporting", "Schedule P/F", "Board reporting"],
  },
];

const WAVES = [
  {
    number: 1,
    name: "Quick Wins",
    months: "Months 1–9",
    color: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.3)",
    focus: "High TP score, structured data, proven L2 patterns. Deploy agents where automation is least risky and fastest to implement.",
    targets: ["PA-08 Investment Interface", "PA-13 Cash Management", "PA-03 Premium Accounting", "PA-09 Commissions & AP", "PA-10 Premium Collections", "PA-20 Data Integration"],
    value: "35–50% reduction in manual hours on targeted processes. Baseline ROI established for board.",
  },
  {
    number: 2,
    name: "Core Intelligence",
    months: "Months 9–18",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.3)",
    focus: "Insurance-specific complexity. Deploy agents on the actuarial interface, reinsurance, and regulatory reporting — processes that require deep domain knowledge.",
    targets: ["PA-04 Loss & Claims", "PA-05 Ceded Reinsurance", "PA-02 GL Posting", "PA-11 Intercompany", "PA-14 Expense Allocation", "PA-16 Statutory Reporting", "PA-17 GAAP Reporting", "PA-18 Tax", "PA-19 Management Reporting"],
    value: "2-day close cycle reduction. 80+ hours saved per quarter-end filing. L3 analytics visible to CFO.",
  },
  {
    number: 3,
    name: "Autonomous Finance",
    months: "Months 18–30",
    color: "#A855F7",
    bg: "rgba(168,85,247,0.08)",
    border: "rgba(168,85,247,0.3)",
    focus: "Orchestration layer. Wave 1–2 agents are operational — now connect them under a close conductor. Begin designing L4 multi-agent architecture.",
    targets: ["PA-15 Financial Close (L3)", "PA-01 CoA Governance", "PA-12 Fixed Assets", "Close Conductor prototype"],
    value: "Close cycle cut by 40%. Continuous accounting on premium and investment. L3 close operating in production.",
  },
  {
    number: 4,
    name: "Orchestrating Agent",
    months: "Months 30+",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.3)",
    focus: "L4 multi-agent orchestration. CFO command center with autonomous cross-agent coordination, predictive close analytics, and AI-native regulatory filing.",
    targets: ["PA-06 Assumed Reinsurance", "PA-07 Life Reserves (if in scope)", "L4 CFO Command Center", "Cross-entity regulatory agent"],
    value: "Finance function operates as autonomous finance nerve center. Human oversight at policy level only.",
  },
];

const VALUE_METRICS = [
  { metric: "Close Cycle Reduction", wave1: "—", wave2: "1–2 days", wave3: "3–4 days", wave4: "5+ days (continuous)" },
  { metric: "Manual Hours Saved / Year", wave1: "500–1,200 hrs", wave2: "2,000–4,000 hrs", wave3: "5,000–8,000 hrs", wave4: "Structural" },
  { metric: "Reconciliation Break MTTR", wave1: "Hours → minutes", wave2: "Minutes → real-time", wave3: "Predictive prevention", wave4: "Near-zero breaks" },
  { metric: "Regulatory Filing Effort", wave1: "—", wave2: "30–40% reduction", wave3: "60% reduction", wave4: "Agent-generated drafts" },
  { metric: "Agent Coverage (of 20 PAs)", wave1: "6 PAs", wave2: "15 PAs", wave3: "18 PAs", wave4: "20 PAs" },
  { metric: "Human Oversight Level", wave1: "Exception review", wave2: "Exception + approval", wave3: "Policy-level", wave4: "Governance only" },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] uppercase tracking-[0.2em] font-semibold text-muted/50 mb-4">
      {children}
    </p>
  );
}

function MaturityCard({ level }: { level: typeof MATURITY_LEVELS[number] }) {
  return (
    <div
      style={{
        backgroundColor: level.bg,
        border: `1px solid ${level.border}`,
        borderRadius: 12,
        padding: "20px 22px",
        flex: 1,
        minWidth: 0,
      }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            fontWeight: 700,
            color: level.color,
            backgroundColor: `${level.color}18`,
            border: `1px solid ${level.color}40`,
            borderRadius: 5,
            padding: "2px 7px",
            flexShrink: 0,
          }}
        >
          {level.level}
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: level.color,
          }}
        >
          {level.name}
        </span>
      </div>
      <p
        style={{
          fontSize: 11,
          color: "#94A3B8",
          lineHeight: 1.55,
          marginBottom: 12,
        }}
      >
        {level.description}
      </p>
      <div className="space-y-1">
        {level.examples.map((ex) => (
          <p
            key={ex}
            style={{
              fontSize: 10,
              color: "#64748B",
              display: "flex",
              gap: 6,
              alignItems: "flex-start",
            }}
          >
            <span style={{ color: level.color, flexShrink: 0, marginTop: 1 }}>›</span>
            {ex}
          </p>
        ))}
      </div>
    </div>
  );
}

function DimensionCard({ dim }: { dim: typeof DIMENSIONS[number] }) {
  return (
    <div
      style={{
        backgroundColor: "#1E293B",
        border: "1px solid rgba(71,85,105,0.4)",
        borderRadius: 10,
        padding: "16px 18px",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            fontWeight: 700,
            color: dim.color,
            backgroundColor: `${dim.color}18`,
            border: `1px solid ${dim.color}35`,
            borderRadius: 4,
            padding: "1px 6px",
          }}
        >
          {dim.id}
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#F1F5F9" }}>{dim.name}</span>
      </div>
      <p style={{ fontSize: 10.5, color: "#94A3B8", lineHeight: 1.5, marginBottom: 10 }}>
        {dim.description}
      </p>
      <div className="space-y-1">
        <p style={{ fontSize: 9.5, color: "#64748B" }}>
          <span style={{ color: dim.color, marginRight: 4 }}>▲ High:</span>
          {dim.hi}
        </p>
        <p style={{ fontSize: 9.5, color: "#64748B" }}>
          <span style={{ color: "#475569", marginRight: 4 }}>▼ Low:</span>
          {dim.lo}
        </p>
      </div>
    </div>
  );
}

function PatternCard({ pattern }: { pattern: typeof PATTERNS[number] }) {
  return (
    <div
      style={{
        backgroundColor: pattern.bg,
        border: `1px solid ${pattern.border}`,
        borderRadius: 10,
        padding: "16px 18px",
      }}
    >
      <div className="flex items-center gap-2.5 mb-2.5">
        <span
          style={{
            fontSize: 16,
            color: pattern.color,
            fontFamily: "monospace",
            lineHeight: 1,
          }}
        >
          {pattern.icon}
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#F1F5F9" }}>{pattern.name}</span>
      </div>
      <p style={{ fontSize: 10.5, color: "#94A3B8", lineHeight: 1.5, marginBottom: 10 }}>
        {pattern.description}
      </p>
      <div className="flex flex-wrap gap-1">
        {pattern.processes.map((p) => (
          <span
            key={p}
            style={{
              fontSize: 8.5,
              color: pattern.color,
              backgroundColor: `${pattern.color}12`,
              border: `1px solid ${pattern.color}25`,
              borderRadius: 4,
              padding: "2px 7px",
            }}
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}

function WaveCard({ wave }: { wave: typeof WAVES[number] }) {
  return (
    <div
      style={{
        backgroundColor: wave.bg,
        border: `1px solid ${wave.border}`,
        borderRadius: 12,
        padding: "20px 22px",
      }}
    >
      <div className="flex items-baseline gap-3 mb-2">
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            fontWeight: 700,
            color: wave.color,
            backgroundColor: `${wave.color}18`,
            border: `1px solid ${wave.color}40`,
            borderRadius: 4,
            padding: "2px 7px",
          }}
        >
          WAVE {wave.number}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#F1F5F9" }}>{wave.name}</span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color: "#64748B",
            marginLeft: "auto",
          }}
        >
          {wave.months}
        </span>
      </div>
      <p style={{ fontSize: 10.5, color: "#94A3B8", lineHeight: 1.55, marginBottom: 12 }}>
        {wave.focus}
      </p>
      <div className="flex flex-wrap gap-1 mb-3">
        {wave.targets.map((t) => (
          <span
            key={t}
            style={{
              fontSize: 8.5,
              color: "#94A3B8",
              backgroundColor: "rgba(71,85,105,0.2)",
              border: "1px solid rgba(71,85,105,0.3)",
              borderRadius: 4,
              padding: "2px 7px",
            }}
          >
            {t}
          </span>
        ))}
      </div>
      <div
        style={{
          borderTop: `1px solid ${wave.border}`,
          paddingTop: 10,
          marginTop: 4,
        }}
      >
        <p style={{ fontSize: 10, color: wave.color, lineHeight: 1.5 }}>
          <span style={{ opacity: 0.6, marginRight: 4 }}>Value:</span>
          {wave.value}
        </p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FrameworkPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0F172A",
        color: "#F1F5F9",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* Nav bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          backgroundColor: "rgba(15,23,42,0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(71,85,105,0.3)",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          height: 52,
          gap: 24,
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: "#475569",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ← FTA
        </Link>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#334155" }}>
          /
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: "#64748B",
          }}
        >
          framework
        </span>
        <div style={{ marginLeft: "auto" }}>
          <Link
            href="/eng-001/deliverables/d-004-01"
            style={{
              fontSize: 10,
              fontWeight: 500,
              color: "#3B82F6",
              textDecoration: "none",
              backgroundColor: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.3)",
              borderRadius: 6,
              padding: "5px 12px",
            }}
          >
            View Process Inventory ↗
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "64px 32px 96px" }}>

        {/* Hero */}
        <div style={{ marginBottom: 72 }}>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#3B82F6",
              marginBottom: 16,
            }}
          >
            AI & Agentic Engineering
          </p>
          <h1
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: 44,
              fontWeight: 400,
              lineHeight: 1.15,
              color: "#F1F5F9",
              marginBottom: 20,
              maxWidth: 720,
            }}
          >
            Reimagining Insurance Finance with Autonomous Agent Architectures
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "#94A3B8",
              lineHeight: 1.65,
              maxWidth: 640,
              marginBottom: 28,
            }}
          >
            A structured framework for sequencing AI agent deployment across all 20 insurance finance process areas — from manual spreadsheets to a fully autonomous finance function.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { label: "20 Process Areas", color: "#3B82F6" },
              { label: "5 Maturity Levels", color: "#A855F7" },
              { label: "6 Architecture Patterns", color: "#10B981" },
              { label: "4-Wave Roadmap", color: "#F59E0B" },
            ].map(({ label, color }) => (
              <span
                key={label}
                style={{
                  fontSize: 10,
                  color,
                  backgroundColor: `${color}12`,
                  border: `1px solid ${color}30`,
                  borderRadius: 6,
                  padding: "5px 12px",
                  fontWeight: 500,
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Why Insurance Finance */}
        <div style={{ marginBottom: 72 }}>
          <SectionLabel>Why Insurance Finance</SectionLabel>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
            }}
          >
            <div
              style={{
                backgroundColor: "#1E293B",
                border: "1px solid rgba(71,85,105,0.4)",
                borderRadius: 12,
                padding: "24px 28px",
              }}
            >
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: "#F1F5F9" }}>
                The Finance Transformation Problem
              </h3>
              <div className="space-y-3">
                {[
                  "Insurance finance operates with 4–5× the process complexity of general finance — statutory, GAAP, and management bases run simultaneously",
                  "The actuarial-to-GL interface alone absorbs 15–25% of close capacity at most P&C carriers",
                  "Reinsurance accounting requires treaty document interpretation — historically impossible to automate",
                  "Regulatory filings (NAIC, RBC, Schedule P) require deterministic data lineage that ERP systems don't provide natively",
                ].map((point, i) => (
                  <p key={i} style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.55, display: "flex", gap: 10 }}>
                    <span style={{ color: "#EF4444", flexShrink: 0, fontFamily: "monospace", marginTop: 2 }}>
                      {i + 1}.
                    </span>
                    {point}
                  </p>
                ))}
              </div>
            </div>
            <div
              style={{
                backgroundColor: "#1E293B",
                border: "1px solid rgba(71,85,105,0.4)",
                borderRadius: 12,
                padding: "24px 28px",
              }}
            >
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: "#F1F5F9" }}>
                Why AI Agents Change the Calculus
              </h3>
              <div className="space-y-3">
                {[
                  "LLMs can interpret semi-structured reinsurance treaty language — turning the hardest processes into automation candidates",
                  "Agentic workflows handle multi-step reconciliation with exception escalation — replacing manual matching that currently runs overnight",
                  "Agent-generated NAIC disclosures can be traced sentence-by-sentence to GL source data — audit-grade lineage at scale",
                  "Close orchestration agents coordinate 40+ dependencies in real time — the equivalent of a full-time close manager operating continuously",
                ].map((point, i) => (
                  <p key={i} style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.55, display: "flex", gap: 10 }}>
                    <span style={{ color: "#10B981", flexShrink: 0, fontFamily: "monospace", marginTop: 2 }}>
                      {i + 1}.
                    </span>
                    {point}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Maturity Model */}
        <div style={{ marginBottom: 72 }}>
          <SectionLabel>Agent Maturity Model</SectionLabel>
          <div style={{ display: "flex", gap: 14, alignItems: "stretch" }}>
            {MATURITY_LEVELS.map((level) => (
              <MaturityCard key={level.level} level={level} />
            ))}
          </div>
          <div
            style={{
              marginTop: 16,
              backgroundColor: "rgba(59,130,246,0.06)",
              border: "1px solid rgba(59,130,246,0.2)",
              borderRadius: 8,
              padding: "12px 18px",
            }}
          >
            <p style={{ fontSize: 10.5, color: "#64748B", lineHeight: 1.5 }}>
              <span style={{ color: "#3B82F6", marginRight: 6 }}>Note:</span>
              Levels are not a universal hierarchy — the appropriate level for each process depends on its TP score, regulatory constraint, and data maturity. Most insurance finance processes will reach L2–L3. L4 is reserved for orchestration layers.
            </p>
          </div>
        </div>

        {/* Assessment Dimensions */}
        <div style={{ marginBottom: 72 }}>
          <SectionLabel>6 Assessment Dimensions</SectionLabel>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
              marginBottom: 20,
            }}
          >
            {DIMENSIONS.map((dim) => (
              <DimensionCard key={dim.id} dim={dim} />
            ))}
          </div>
          <div
            style={{
              backgroundColor: "rgba(168,85,247,0.06)",
              border: "1px solid rgba(168,85,247,0.2)",
              borderRadius: 8,
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                fontWeight: 700,
                color: "#A855F7",
                flexShrink: 0,
              }}
            >
              TP
            </span>
            <span style={{ fontSize: 12, color: "#94A3B8", fontFamily: "'JetBrains Mono', monospace" }}>
              = ( AR + AV + DM ) − RE − RC
            </span>
            <span style={{ fontSize: 11, color: "#64748B", marginLeft: 8 }}>
              Total Priority Score drives wave sequencing. High TP → automate first. Negative TP → later wave.
            </span>
          </div>
        </div>

        {/* Architecture Patterns */}
        <div style={{ marginBottom: 72 }}>
          <SectionLabel>6 Architecture Patterns</SectionLabel>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            {PATTERNS.map((pattern) => (
              <PatternCard key={pattern.id} pattern={pattern} />
            ))}
          </div>
        </div>

        {/* 4-Wave Roadmap */}
        <div style={{ marginBottom: 72 }}>
          <SectionLabel>4-Wave Implementation Roadmap</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            {WAVES.map((wave) => (
              <WaveCard key={wave.number} wave={wave} />
            ))}
          </div>

          {/* Timeline bar */}
          <div
            style={{
              backgroundColor: "#1E293B",
              border: "1px solid rgba(71,85,105,0.35)",
              borderRadius: 10,
              padding: "16px 20px",
            }}
          >
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                color: "#475569",
                marginBottom: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Timeline
            </p>
            <div style={{ display: "flex", gap: 0, borderRadius: 6, overflow: "hidden", height: 8 }}>
              {WAVES.map((w) => (
                <div
                  key={w.number}
                  style={{
                    flex: w.number === 1 ? 9 : w.number === 2 ? 9 : w.number === 3 ? 12 : 10,
                    backgroundColor: w.color,
                    opacity: 0.7,
                  }}
                />
              ))}
            </div>
            <div style={{ display: "flex", gap: 0, marginTop: 4 }}>
              {WAVES.map((w) => (
                <div
                  key={w.number}
                  style={{
                    flex: w.number === 1 ? 9 : w.number === 2 ? 9 : w.number === 3 ? 12 : 10,
                    fontSize: 8.5,
                    color: w.color,
                    fontFamily: "'JetBrains Mono', monospace",
                    paddingTop: 4,
                    opacity: 0.8,
                  }}
                >
                  {w.months}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Value Metrics */}
        <div style={{ marginBottom: 72 }}>
          <SectionLabel>Value Metrics by Wave</SectionLabel>
          <div
            style={{
              backgroundColor: "#1E293B",
              border: "1px solid rgba(71,85,105,0.4)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(71,85,105,0.5)" }}>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px 18px",
                      fontSize: 9.5,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "#475569",
                      letterSpacing: "0.08em",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      width: "28%",
                    }}
                  >
                    Metric
                  </th>
                  {WAVES.map((w) => (
                    <th
                      key={w.number}
                      style={{
                        textAlign: "center",
                        padding: "12px 14px",
                        fontSize: 9,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: w.color,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      W{w.number}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {VALUE_METRICS.map((row, i) => (
                  <tr
                    key={row.metric}
                    style={{
                      borderBottom:
                        i < VALUE_METRICS.length - 1 ? "1px solid rgba(71,85,105,0.2)" : "none",
                    }}
                  >
                    <td style={{ padding: "10px 18px", fontSize: 11, color: "#94A3B8" }}>
                      {row.metric}
                    </td>
                    {[row.wave1, row.wave2, row.wave3, row.wave4].map((val, wi) => (
                      <td
                        key={wi}
                        style={{
                          padding: "10px 14px",
                          fontSize: 10,
                          color: val === "—" ? "#334155" : "#F1F5F9",
                          textAlign: "center",
                          fontFamily: val === "—" ? undefined : "'JetBrains Mono', monospace",
                        }}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            backgroundColor: "rgba(59,130,246,0.06)",
            border: "1px solid rgba(59,130,246,0.2)",
            borderRadius: 16,
            padding: "32px 36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#F1F5F9", marginBottom: 6 }}>
              See the framework applied to Acme P&C
            </h3>
            <p style={{ fontSize: 11.5, color: "#94A3B8", lineHeight: 1.55, maxWidth: 480 }}>
              The Process Inventory shows wave assignments, agent levels, and agentic opportunity for all 20 finance process areas in the engagement scope.
            </p>
          </div>
          <Link
            href="/eng-001/deliverables/d-004-01"
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#0F172A",
              textDecoration: "none",
              backgroundColor: "#3B82F6",
              borderRadius: 8,
              padding: "11px 24px",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            Open Process Inventory ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
