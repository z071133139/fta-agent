"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import {
  MOCK_ENGAGEMENTS,
  MOCK_PURSUITS,
  PHASE_LABELS,
  type Engagement,
  type Pursuit,
  type EngagementPhase,
} from "@/lib/mock-data";
import { ContextSelector } from "@/components/landing/ContextSelector";
import { AttentionQueue } from "@/components/landing/AttentionQueue";
import { PursuitContent } from "@/components/landing/PursuitContent";
import { WorkplanPanel } from "@/components/WorkplanPanel";

// ── Helpers ───────────────────────────────────────────────────────────────

const STORAGE_KEY = "fta_selected_context";

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const time =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return `${time}, ${name.split(" ")[0]}.`;
}

function getContextLine(engagements: Engagement[]): string {
  const active = engagements.filter((e) => e.is_active);
  if (active.length === 0) return "You have no active engagements.";
  const urgent = active.find((e) => e.stats.open_decisions > 0);
  if (urgent)
    return `${urgent.client_name} has ${urgent.stats.open_decisions} decision${urgent.stats.open_decisions > 1 ? "s" : ""} waiting for your input.`;
  return `You have ${active.length} active engagement${active.length > 1 ? "s" : ""}.`;
}

// ── Typewriter hook ─────────────────────────────────────────────────────

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

// ── Phase border helpers ─────────────────────────────────────────────────

const PHASE_GLOW: Record<EngagementPhase, string> = {
  discovery: "rgba(6,182,212,0.12)",
  current_state: "rgba(245,158,11,0.12)",
  design: "rgba(59,130,246,0.12)",
  build: "rgba(168,85,247,0.12)",
  test: "rgba(16,185,129,0.12)",
  cutover: "rgba(16,185,129,0.12)",
};

const PHASE_BORDER: Record<EngagementPhase, string> = {
  discovery: "border-l-[var(--color-phase-discovery)]",
  current_state: "border-l-[var(--color-phase-current-state)]",
  design: "border-l-[var(--color-phase-design)]",
  build: "border-l-[var(--color-phase-build)]",
  test: "border-l-[var(--color-phase-test)]",
  cutover: "border-l-[var(--color-phase-test)]",
};

// ── First Visit Card Picker ──────────────────────────────────────────────

function CardPicker({
  engagements,
  pursuits,
  onSelect,
}: {
  engagements: Engagement[];
  pursuits: Pursuit[];
  onSelect: (id: string, kind: "engagement" | "pursuit") => void;
}) {
  return (
    <div>
      {/* Engagements */}
      {engagements.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[9px] uppercase tracking-[0.15em] text-muted/60 font-medium">
              Engagements
            </span>
            <div className="flex-1 h-px bg-border/20" />
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {engagements.map((eng) => (
              <motion.button
                key={eng.engagement_id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                onClick={() => onSelect(eng.engagement_id, "engagement")}
                style={{
                  boxShadow: `0 0 0 1px rgba(255,255,255,0.04)`,
                }}
                className={`cursor-pointer rounded-lg bg-surface border-l-4 ${PHASE_BORDER[eng.phase]} p-5 text-left transition-shadow hover:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_32px_${PHASE_GLOW[eng.phase]}]`}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className="text-base font-semibold text-foreground leading-tight">
                      {eng.client_name}
                    </h3>
                    <p className="text-xs text-muted mt-0.5">
                      {eng.sub_segment} · {eng.erp_target} · {eng.last_active}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-muted bg-surface-alt px-2 py-1 rounded">
                    {PHASE_LABELS[eng.phase]}
                  </span>
                </div>

                {/* Consultants */}
                <div className="flex items-center gap-1.5 mb-3">
                  {eng.consultants.slice(0, 4).map((c) => (
                    <div
                      key={c.consultant_id}
                      className="h-5 w-5 rounded-full bg-surface-alt flex items-center justify-center text-[9px] font-medium text-muted"
                    >
                      {c.initials}
                    </div>
                  ))}
                </div>

                {/* Stats line */}
                <div className="flex flex-wrap gap-2 text-xs mb-3">
                  {eng.stats.open_decisions > 0 && (
                    <span className="text-warning font-medium">
                      {eng.stats.open_decisions} decisions
                    </span>
                  )}
                  {eng.stats.high_findings > 0 && (
                    <span className="text-error font-medium">
                      {eng.stats.high_findings} HIGH
                    </span>
                  )}
                  {eng.stats.open_decisions === 0 &&
                    eng.stats.high_findings === 0 && (
                      <span className="text-success">No urgent items</span>
                    )}
                </div>

                <span className="text-xs font-medium text-accent">Open ›</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Pursuits */}
      {pursuits.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[9px] uppercase tracking-[0.15em] text-muted/60 font-medium">
              Pursuits
            </span>
            <div className="flex-1 h-px bg-border/20" />
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {pursuits.map((p) => (
              <motion.button
                key={p.pursuit_id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                onClick={() => onSelect(p.pursuit_id, "pursuit")}
                className="cursor-pointer rounded-lg bg-surface border-l-4 border-l-cyan-500 p-5 text-left transition-shadow hover:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_32px_rgba(6,182,212,0.12)]"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className="text-base font-semibold text-foreground leading-tight">
                      {p.name}
                    </h3>
                    <p className="text-xs text-muted mt-0.5">
                      {p.sub_segment} · {p.meeting_type}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">
                    Pursuit
                  </span>
                </div>
                <p className="text-xs text-muted mb-3">{p.summary}</p>
                <span className="text-xs font-medium text-accent">Open ›</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <Suspense fallback={null}>
      <LandingPageInner />
    </Suspense>
  );
}

function LandingPageInner() {
  const { consultant, isLoading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Restore from query param or localStorage
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedKind, setSelectedKind] = useState<"engagement" | "pursuit">(
    "engagement"
  );

  useEffect(() => {
    // Priority: query param > localStorage
    const engParam = searchParams.get("eng");
    const pursuitParam = searchParams.get("pursuit");
    if (engParam) {
      setSelectedId(engParam);
      setSelectedKind("engagement");
      return;
    }
    if (pursuitParam) {
      setSelectedId(pursuitParam);
      setSelectedKind("pursuit");
      return;
    }
    // localStorage fallback
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { id: string; kind: "engagement" | "pursuit" };
        setSelectedId(parsed.id);
        setSelectedKind(parsed.kind);
      }
    } catch {
      // ignore
    }
  }, [searchParams]);

  const handleSelect = useCallback(
    (id: string, kind: "engagement" | "pursuit") => {
      setSelectedId(id);
      setSelectedKind(kind);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ id, kind }));
      } catch {
        // ignore
      }
    },
    []
  );

  const engagements = MOCK_ENGAGEMENTS;
  const pursuits = MOCK_PURSUITS;

  const greetingText = consultant ? getGreeting(consultant.display_name) : "";
  const contextText = getContextLine(engagements);
  const greeting = useTypewriter(greetingText, 300, 30);
  const context = useTypewriter(
    greeting.done ? contextText : "",
    greeting.done ? 300 : 9999,
    18
  );

  useEffect(() => {
    if (!isLoading && !consultant) router.replace("/login");
  }, [consultant, isLoading, router]);

  if (isLoading || !consultant) return null;

  const selectedEngagement =
    selectedKind === "engagement"
      ? engagements.find((e) => e.engagement_id === selectedId) ?? null
      : null;
  const selectedPursuit =
    selectedKind === "pursuit"
      ? pursuits.find((p) => p.pursuit_id === selectedId) ?? null
      : null;

  const hasSelection = selectedEngagement || selectedPursuit;

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

      <div className="relative mx-auto max-w-7xl px-8 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <span className="font-serif text-xl text-foreground tracking-tight">
            FTA
          </span>
          <div className="flex items-center gap-5">
            <a
              href="/framework"
              className="text-xs font-mono text-muted/50 hover:text-muted transition-colors"
            >
              framework ↗
            </a>
            <button
              onClick={logout}
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          </div>
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

        {/* Context Selector */}
        <div className="mb-8">
          <ContextSelector
            engagements={engagements}
            pursuits={pursuits}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </div>

        {/* Content — adapts to selection type */}
        {!hasSelection ? (
          <CardPicker
            engagements={engagements}
            pursuits={pursuits}
            onSelect={handleSelect}
          />
        ) : selectedEngagement ? (
          <EngagementContent engagement={selectedEngagement} />
        ) : selectedPursuit ? (
          <PursuitMissionControl pursuit={selectedPursuit} />
        ) : null}
      </div>
    </div>
  );
}

// ── Engagement Mission Control ────────────────────────────────────────────

function EngagementContent({
  engagement,
}: {
  engagement: Engagement;
}) {
  return (
    <div className="flex flex-col gap-8">
      <AttentionQueue engagement={engagement} />
      <WorkplanPanel engagement={engagement} />
    </div>
  );
}

// ── Pursuit Mission Control ───────────────────────────────────────────────

function PursuitMissionControl({
  pursuit,
}: {
  pursuit: Pursuit;
}) {
  return (
    <PursuitContent pursuit={pursuit} />
  );
}
