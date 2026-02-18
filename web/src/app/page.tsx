"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import {
  MOCK_ENGAGEMENTS,
  AGENT_CARDS,
  PHASE_LABELS,
  type Engagement,
  type EngagementPhase,
} from "@/lib/mock-data";
import { WorkplanPanel } from "@/components/WorkplanPanel";

// ── Helpers ───────────────────────────────────────────────────────────────

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const time =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return `${time}, ${name.split(" ")[0]}.`;
}

function getContextLine(engagements: Engagement[]): string {
  const active = engagements.filter((e) => e.is_active);
  if (active.length === 0)
    return "You have no active engagements. Start one below.";
  const urgent = active.find((e) => e.stats.open_decisions > 0);
  if (urgent)
    return `${urgent.client_name} has ${urgent.stats.open_decisions} decision${urgent.stats.open_decisions > 1 ? "s" : ""} waiting for your input.`;
  return `You have ${active.length} active engagement${active.length > 1 ? "s" : ""}.`;
}

const PHASE_BORDER: Record<EngagementPhase, string> = {
  discovery:     "border-l-[var(--color-phase-discovery)]",
  current_state: "border-l-[var(--color-phase-current-state)]",
  design:        "border-l-[var(--color-phase-design)]",
  build:         "border-l-[var(--color-phase-build)]",
  test:          "border-l-[var(--color-phase-test)]",
  cutover:       "border-l-[var(--color-phase-test)]",
};

const PHASE_GLOW: Record<EngagementPhase, string> = {
  discovery:     "rgba(6,182,212,0.15)",
  current_state: "rgba(245,158,11,0.15)",
  design:        "rgba(59,130,246,0.15)",
  build:         "rgba(168,85,247,0.15)",
  test:          "rgba(16,185,129,0.15)",
  cutover:       "rgba(16,185,129,0.15)",
};

// ── Typewriter hook ───────────────────────────────────────────────────────

function useTypewriter(text: string, delay = 0, speed = 28) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!text) return;
    setDisplayed("");
    setDone(false);
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay, speed]);

  return { displayed, done };
}

// ── Engagement Card ───────────────────────────────────────────────────────

function EngagementCard({
  engagement,
  selected,
  onSelect,
}: {
  engagement: Engagement;
  selected: boolean;
  onSelect: () => void;
}) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const { stats, phase } = engagement;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onSelect}
      style={{
        boxShadow: hovered
          ? `0 0 0 1px rgba(255,255,255,0.06), 0 8px 32px ${PHASE_GLOW[phase]}`
          : selected
          ? `0 0 0 1px rgba(59,130,246,0.3)`
          : "0 0 0 1px rgba(255,255,255,0.04)",
        transform: hovered ? "translateY(-2px)" : "translateY(0px)",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
      }}
      className={`cursor-pointer rounded-lg bg-surface border-l-4 ${PHASE_BORDER[phase]} p-5`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="text-base font-semibold text-foreground leading-tight tracking-tight">
            {engagement.client_name}
          </h3>
          <p className="text-xs text-muted mt-0.5">
            {engagement.sub_segment} · {engagement.erp_target} · Last active{" "}
            {engagement.last_active}
          </p>
        </div>
        <span className="shrink-0 text-xs font-medium text-muted bg-surface-alt px-2 py-1 rounded">
          {PHASE_LABELS[phase]}
        </span>
      </div>

      {/* Consultant avatars */}
      <div className="flex items-center gap-1.5 mb-4">
        {engagement.consultants.slice(0, 4).map((c) => (
          <div
            key={c.consultant_id}
            title={c.display_name}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-alt text-[10px] font-medium text-muted"
          >
            {c.initials}
          </div>
        ))}
        {engagement.consultants.length > 4 && (
          <span className="text-xs text-muted">+{engagement.consultants.length - 4}</span>
        )}
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        {stats.open_decisions > 0 && (
          <span className="text-warning font-medium">
            {stats.open_decisions} open decision{stats.open_decisions > 1 ? "s" : ""}
          </span>
        )}
        {stats.high_findings > 0 && (
          <span className="text-error font-medium">
            {stats.high_findings} HIGH finding{stats.high_findings > 1 ? "s" : ""}
          </span>
        )}
        {stats.requirements > 0 && (
          <span className="text-muted">
            {stats.requirements} req
            {stats.unvalidated_reqs > 0 && (
              <span className="text-warning"> · {stats.unvalidated_reqs} unvalidated</span>
            )}
          </span>
        )}
        {stats.blocked_items > 0 && (
          <span className="text-warning">{stats.blocked_items} blocked</span>
        )}
        {stats.open_decisions === 0 && stats.high_findings === 0 && stats.blocked_items === 0 && (
          <span className="text-success">No urgent items</span>
        )}
      </div>

      {/* Agent buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "GL Design Coach", slug: "gl-coach" },
          { label: "Functional", slug: "functional" },
          { label: "Consulting", slug: "consulting" },
        ].map((a) => (
          <button
            key={a.slug}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/${engagement.engagement_id}/${a.slug}`);
            }}
            className="rounded px-3 py-1.5 text-xs font-medium bg-surface-alt text-muted hover:bg-accent/20 hover:text-accent transition-colors"
          >
            {a.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ── Agent Team Card ───────────────────────────────────────────────────────

function AgentTeamCard({
  agent,
  engagement,
  index,
}: {
  agent: (typeof AGENT_CARDS)[number];
  engagement: Engagement | null;
  index: number;
}) {
  const router = useRouter();
  const stats = engagement?.stats ?? null;

  const statLine: Record<string, string | null> = {
    gl_design_coach: stats
      ? `${stats.open_decisions} open decisions · ${stats.high_findings} HIGH findings`
      : null,
    functional_consultant: stats
      ? `${stats.requirements} requirements · ${stats.unvalidated_reqs} unvalidated`
      : null,
    consulting_agent: stats
      ? `${stats.blocked_items} blocked · ${PHASE_LABELS[engagement!.phase]} phase`
      : null,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.06 }}
      whileHover={{ y: -2 }}
      className="flex flex-col gap-4 rounded-lg bg-surface border border-border p-5 transition-shadow hover:shadow-[0_0_0_1px_rgba(255,255,255,0.07)]"
    >
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-semibold text-foreground">{agent.name}</h3>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="text-xs text-muted">Available</span>
          </div>
        </div>
        <p className="text-xs text-muted">{agent.role}</p>
      </div>

      <p className="text-xs text-muted leading-relaxed">{agent.description}</p>

      {statLine[agent.agent_id] && (
        <p className="text-xs font-mono text-muted border-t border-border pt-3">
          {statLine[agent.agent_id]}
        </p>
      )}

      <button
        onClick={() => {
          if (engagement) {
            router.push(
              `/${engagement.engagement_id}/${agent.agent_id.replace(/_/g, "-")}`
            );
          }
        }}
        disabled={!engagement}
        className="mt-auto w-full rounded py-2 text-xs font-medium text-muted bg-surface-alt hover:bg-accent/20 hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {engagement
          ? `Open for ${engagement.client_name} ›`
          : "Select an engagement"}
      </button>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { consultant, isLoading, logout } = useAuth();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !consultant) router.replace("/login");
  }, [consultant, isLoading, router]);

  const engagements = MOCK_ENGAGEMENTS;
  const primaryEngagement =
    engagements.find((e) => e.engagement_id === selectedId) ??
    engagements[0] ??
    null;

  const greetingText = consultant ? getGreeting(consultant.display_name) : "";
  const contextText = getContextLine(engagements);

  const greeting = useTypewriter(greetingText, 300, 30);
  const context = useTypewriter(
    greeting.done ? contextText : "",
    greeting.done ? 300 : 9999,
    18
  );

  if (isLoading || !consultant) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient top glow */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-[50vh] opacity-[0.035]"
        style={{
          background:
            "radial-gradient(ellipse 80% 100% at 50% -10%, #3B82F6 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-8 py-8">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <span className="font-serif text-xl text-foreground tracking-tight">FTA</span>
          <button
            onClick={logout}
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-foreground mb-2 min-h-[1.75rem]">
            {greeting.displayed}
            {!greeting.done && <span className="cursor-blink" />}
          </h1>
          <p className="text-base text-muted min-h-[1.5rem]">
            {context.displayed}
            {greeting.done && !context.done && (
              <span className="cursor-blink" />
            )}
          </p>
        </div>

        {/* Engagements section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[10px] uppercase tracking-[0.15em] text-muted font-medium">
              Active Engagements
            </h2>
            <button className="text-xs text-muted hover:text-foreground transition-colors">
              + New Engagement
            </button>
          </div>

          {engagements.length === 0 ? (
            <div className="rounded-lg bg-surface border border-border p-8 text-center text-sm text-muted">
              No active engagements. Start one to begin.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {engagements.map((eng) => (
                <EngagementCard
                  key={eng.engagement_id}
                  engagement={eng}
                  selected={selectedId === eng.engagement_id}
                  onSelect={() =>
                    setSelectedId((prev) =>
                      prev === eng.engagement_id ? null : eng.engagement_id
                    )
                  }
                />
              ))}
            </div>
          )}

          {/* Workplan panel — full-width, slides in below cards */}
          <AnimatePresence mode="wait">
            {selectedId && primaryEngagement && (
              <WorkplanPanel
                key={selectedId}
                engagement={primaryEngagement}
              />
            )}
          </AnimatePresence>
        </section>

        {/* Agent team section */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[10px] uppercase tracking-[0.15em] text-muted font-medium">
              Your Consulting Team
            </h2>
            {engagements.length > 1 && (
              <select
                value={primaryEngagement?.engagement_id ?? ""}
                onChange={(e) => setSelectedId(e.target.value)}
                className="text-xs bg-surface border border-border rounded px-2 py-1 text-muted focus:outline-none focus:border-accent"
              >
                {engagements.map((e) => (
                  <option key={e.engagement_id} value={e.engagement_id}>
                    {e.client_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {AGENT_CARDS.map((agent, i) => (
              <AgentTeamCard
                key={agent.agent_id}
                agent={agent}
                engagement={primaryEngagement}
                index={i}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
