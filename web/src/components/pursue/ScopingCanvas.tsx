"use client";

import { useEffect, useCallback, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getScopingThemes,
  getContextTile,
  getQuestionsForMode,
  type ScopingTheme,
} from "@/lib/scoping-data";
import { useScopingStore, type ThemeStatus } from "@/lib/scoping-store";
import { ThemePanel } from "./ThemePanel";
import { ScopingExport } from "./ScopingExport";

// ── Parallax Tilt ────────────────────────────────────────────────────────────

function useParallaxTilt(ref: React.RefObject<HTMLDivElement | null>, maxDeg = 1.2) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      // Normalize to [-1, 1]
      const nx = (e.clientX - cx) / (rect.width / 2);
      const ny = (e.clientY - cy) / (rect.height / 2);
      // Clamp
      const clamp = (v: number) => Math.max(-1, Math.min(1, v));
      setTilt({ x: clamp(ny) * -maxDeg, y: clamp(nx) * maxDeg });
    };

    const handleLeave = () => setTilt({ x: 0, y: 0 });

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [ref, maxDeg]);

  return tilt;
}

// ── Position math ─────────────────────────────────────────────────────────────

function useContainerSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
}

function useOrbitalPositions(
  containerWidth: number,
  containerHeight: number,
  themes: ScopingTheme[],
  contextTile: ScopingTheme,
) {
  return useMemo(() => {
    if (containerWidth === 0 || containerHeight === 0) return null;

    const cx = containerWidth / 2;
    // Nudge center down slightly so context node at 12 o'clock isn't clipped
    const cy = containerHeight / 2 + 20;
    const radius = Math.max(160, Math.min(containerWidth, containerHeight) * 0.36);
    const clampedRadius = Math.min(radius, 300);

    // Context node at 12 o'clock (-π/2)
    const contextPos: NodePosition = {
      id: contextTile.id,
      x: cx + clampedRadius * Math.cos(-Math.PI / 2),
      y: cy + clampedRadius * Math.sin(-Math.PI / 2),
    };

    // 7 themes distributed across remaining ~315° arc
    const gapAngle = (Math.PI * 2) / 8; // 45° gap at top
    const startAngle = -Math.PI / 2 + gapAngle / 2;
    const availableArc = Math.PI * 2 - gapAngle;

    const themePositions: NodePosition[] = themes.map((t, i) => ({
      id: t.id,
      x: cx + clampedRadius * Math.cos(startAngle + (availableArc / 7) * (i + 0.5)),
      y: cy + clampedRadius * Math.sin(startAngle + (availableArc / 7) * (i + 0.5)),
    }));

    return { cx, cy, radius: clampedRadius, contextPos, themePositions };
  }, [containerWidth, containerHeight, themes, contextTile]);
}

// ── Dependency Map ────────────────────────────────────────────────────────────

const THEME_DEPENDENCIES: Record<string, string[]> = {
  "theme-1": [],                          // Accounting Foundation — foundational
  "theme-2": ["theme-1"],                 // Insurance Ops → needs GL foundation
  "theme-3": ["theme-1"],                 // Financial Ops → needs GL
  "theme-4": ["theme-1", "theme-7"],      // Close & Consol → needs GL + data feeds
  "theme-5": ["theme-4", "theme-1"],      // Reporting → needs close + GL
  "theme-6": ["theme-5", "theme-7"],      // Analytics → needs reporting + data
  "theme-7": [],                          // Data & Integration — foundational
  "context": [],                          // no deps
};

// ── Progress Ring SVG ─────────────────────────────────────────────────────────

function ProgressRing({
  captured,
  total,
  size,
}: {
  captured: number;
  total: number;
  size: number;
}) {
  const strokeWidth = 3;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = total > 0 ? captured / total : 0;
  const offset = circumference * (1 - progress);

  return (
    <svg
      width={size}
      height={size}
      className="absolute inset-0"
      style={{ transform: "rotate(-90deg)" }}
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#334155"
        strokeWidth={strokeWidth}
        opacity={0.4}
      />
      {/* Progress — muted blue-gray, not green */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#64748B"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </svg>
  );
}

// ── Node Progress Ring (Apple Watch style) ───────────────────────────────────

function NodeProgressRing({
  answered,
  total,
  colorHex,
  size,
}: {
  answered: number;
  total: number;
  colorHex: string;
  size: number;
}) {
  const strokeWidth = 2;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = total > 0 ? answered / total : 0;
  const offset = circumference * (1 - progress);
  return (
    <svg
      width={size}
      height={size}
      className="absolute inset-0 pointer-events-none"
      style={{ transform: "rotate(-90deg)" }}
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#1E293B"
        strokeWidth={strokeWidth}
        opacity={0.5}
      />
      {/* Progress arc — muted */}
      {answered > 0 && (
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#64748B"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      )}
    </svg>
  );
}

// ── Center Hub ────────────────────────────────────────────────────────────────

function CenterHub({
  cx,
  cy,
  captured,
  clientName,
  setClientName,
  hoveredTheme,
}: {
  cx: number;
  cy: number;
  captured: number;
  clientName: string;
  setClientName: (name: string) => void;
  hoveredTheme: ScopingTheme | null;
}) {
  const hubSize = 120;
  const half = hubSize / 2;

  return (
    <motion.div
      className="absolute flex flex-col items-center justify-center z-10"
      style={{
        width: hubSize,
        height: hubSize,
        left: cx - half,
        top: cy - half,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
    >
      {/* Progress ring */}
      <ProgressRing captured={captured} total={7} size={hubSize} />

      {/* Radar sweep overlay — very subtle */}
      <div
        className="absolute inset-0 rounded-full scoping-radar-sweep pointer-events-none"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0%, rgba(59,130,246,0.03) 15%, transparent 30%)",
        }}
      />

      {/* Background circle */}
      <div
        className="absolute inset-[3px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, #1E293B 0%, #0F172A 100%)",
          border: "1px solid #334155",
        }}
      />

      {/* Content — crossfade between default and hovered theme */}
      <div className="relative z-10 flex flex-col items-center px-3 overflow-hidden" style={{ width: hubSize - 16, height: hubSize - 30 }}>
        <AnimatePresence mode="wait">
          {hoveredTheme ? (
            <motion.div
              key={hoveredTheme.id}
              className="flex flex-col items-center justify-center gap-1 w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <span
                className="text-[11px] font-mono text-center leading-relaxed line-clamp-3 text-muted/70"
              >
                {hoveredTheme.executiveQuestion}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              className="flex flex-col items-center justify-center gap-0.5 w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client Name"
                className="bg-transparent text-center text-[13px] font-mono text-foreground placeholder:text-muted/30 focus:outline-none w-full"
                style={{ maxWidth: hubSize - 24 }}
              />
              <span className="text-[8px] font-mono text-muted/50 tracking-wider uppercase">
                Finance Transformation
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Connection Layer (SVG) ────────────────────────────────────────────────────

function ConnectionLayer({
  cx,
  cy,
  hubRadius,
  positions,
  themes,
  expandedId,
  hoveredId,
  highlightedIds,
  captures,
  width,
  height,
}: {
  cx: number;
  cy: number;
  hubRadius: number;
  positions: NodePosition[];
  themes: (ScopingTheme | undefined)[];
  expandedId: string | null;
  hoveredId: string | null;
  highlightedIds: Set<string>;
  captures: Record<string, { status: ThemeStatus }>;
  width: number;
  height: number;
}) {
  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={width}
      height={height}
    >
      <defs>
        {/* Subtle glow filter — used sparingly */}
        <filter id="connection-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {positions.map((pos, i) => {
        const theme = themes[i];
        const status = captures[pos.id]?.status ?? "untouched";
        const isActive = expandedId === pos.id;
        const isHovered = hoveredId === pos.id;
        const isDependencyHighlighted = highlightedIds.has(pos.id);
        const isPanelOpen = expandedId !== null;
        const colorHex = theme?.colorHex ?? "#06B6D4";

        // Calculate line start at hub edge (not center)
        const dx = pos.x - cx;
        const dy = pos.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const startX = dist > 0 ? cx + (dx / dist) * hubRadius : cx;
        const startY = dist > 0 ? cy + (dy / dist) * hubRadius : cy;

        // Determine line styling — muted by default
        let strokeColor = "#334155";
        let strokeOpacity = 0.25;
        let useDash = false;
        let showPulse = false;

        if (status === "captured") {
          strokeColor = "#475569";
          strokeOpacity = 0.5;
        } else if (status === "exploring") {
          strokeColor = "#475569";
          strokeOpacity = 0.4;
          useDash = true;
        } else if (status === "deferred") {
          strokeColor = "#1E293B";
          strokeOpacity = 0.15;
        }

        // Dependency highlighting — subtle brightening
        if (isDependencyHighlighted && !isPanelOpen) {
          strokeColor = "#64748B";
          strokeOpacity = 0.5;
        }

        // Hover — modest brightening, single pulse
        if (isHovered && !isPanelOpen) {
          strokeColor = "#94A3B8";
          strokeOpacity = 0.6;
          showPulse = true;
        }

        // Panel open: active stays visible, others nearly gone
        if (isPanelOpen) {
          if (isActive) {
            strokeColor = "#94A3B8";
            strokeOpacity = 0.7;
            showPulse = true;
          } else {
            strokeOpacity = 0.08;
          }
        }

        return (
          <g key={pos.id}>
            {/* Base line */}
            <motion.line
              x1={startX}
              y1={startY}
              x2={pos.x}
              y2={pos.y}
              stroke={strokeColor}
              strokeWidth={isActive ? 1.5 : 1}
              opacity={strokeOpacity}
              className={`${useDash && !isActive ? "edge-animated" : ""} ${isActive ? "connection-active" : ""}`}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.3 + i * 0.08,
                ease: "easeOut",
              }}
            />
            {/* Subtle directional pulse — only on active/hovered connection */}
            {showPulse && (
              <line
                x1={startX}
                y1={startY}
                x2={pos.x}
                y2={pos.y}
                stroke={strokeColor}
                strokeWidth={1}
                opacity={0.3}
                className="data-stream"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── Orbital Node (Theme or Context) ──────────────────────────────────────────

function OrbitalNode({
  theme,
  x,
  y,
  index,
  isFocused,
  isExpanded,
  isPanelOpen,
  isTunnelDimmed,
  status,
  painLevel,
  answeredCount,
  onExpand,
  onHover,
  onLeave,
}: {
  theme: ScopingTheme;
  x: number;
  y: number;
  index: number;
  isFocused: boolean;
  isExpanded: boolean;
  isPanelOpen: boolean;
  isTunnelDimmed: boolean;
  status: ThemeStatus;
  painLevel: string | null;
  answeredCount: number;
  onExpand: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  const isContext = theme.id === "context";
  const nodeSize = isContext ? 140 : 130;
  const half = nodeSize / 2;
  const colorHex = theme.colorHex;

  // Pain-driven visuals — subtle, no animation unless high pain
  const isTurbulent = painLevel === "critical" || painLevel === "significant";

  // Visual states
  const dimmed = isPanelOpen && !isExpanded;
  const tunnelDim = isTunnelDimmed && !isPanelOpen;
  const baseOpacity = status === "deferred" ? 0.5 : dimmed ? 0.3 : 1;
  const nodeOpacity = tunnelDim ? 0.15 : baseOpacity;

  // Stat line
  const statText = isContext
    ? `${theme.questions.length} questions`
    : `${theme.paIds.length} PA · ${theme.questions.length}q`;

  // Icon circle border/bg — restrained, monochrome unless captured/turbulent
  const iconBorderColor =
    isTurbulent && status === "captured"
      ? "#EF4444"
      : status === "captured" || status === "exploring"
        ? "#475569"
        : "#334155";
  const iconBgColor =
    status === "captured"
      ? (isTurbulent ? "rgba(239,68,68,0.06)" : "rgba(51,65,85,0.3)")
      : status === "exploring"
        ? "rgba(51,65,85,0.15)"
        : "transparent";
  const glowShadow =
    isTurbulent && status === "captured"
      ? "0 0 12px rgba(239,68,68,0.2)"
      : "none";

  return (
    <motion.button
      className="absolute flex flex-col items-center gap-1.5 group focus:outline-none"
      style={{
        width: nodeSize,
        left: x - half,
        top: y - half,
      }}
      onClick={onExpand}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: nodeOpacity }}
      whileHover={{ scale: 1.05 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.5 + index * 0.08,
      }}
    >
      {/* Focus ring — subtle thin line */}
      {isFocused && (
        <div
          className="absolute -inset-1.5 rounded-full border border-muted/30 pointer-events-none"
          style={{ zIndex: -1 }}
        />
      )}

      {/* Icon circle with progress ring */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: isContext ? 52 : 44,
          height: isContext ? 52 : 44,
        }}
      >
        {/* Progress ring overlay */}
        <NodeProgressRing
          answered={answeredCount}
          total={theme.questions.length}
          colorHex={colorHex}
          size={isContext ? 52 : 44}
        />

        {/* Inner circle */}
        <div
          className="absolute flex items-center justify-center rounded-full transition-all duration-200"
          style={{
            inset: 2,
            border: `1px solid ${iconBorderColor}`,
            backgroundColor: iconBgColor,
            boxShadow: glowShadow,
          }}
        >
          {/* Emoji — grayscale by default, color on hover/expanded */}
          <span
            className={`${isContext ? "text-xl" : "text-lg"} transition-all duration-200`}
            style={{
              filter: isExpanded || isTurbulent ? "none" : "grayscale(0.85) brightness(1.2)",
            }}
          >
            {theme.icon}
          </span>
        </div>
      </div>

      {/* Name — white/muted, NOT per-theme color */}
      <span
        className="text-[11px] font-medium leading-tight text-center max-w-full truncate transition-colors duration-200"
        style={{
          color:
            status === "deferred"
              ? "#475569"
              : isExpanded
                ? "#F1F5F9"
                : "#CBD5E1",
        }}
      >
        {theme.name}
      </span>

      {/* Stat line */}
      <span className="text-[9px] font-mono text-muted/40 leading-tight">
        {answeredCount > 0 ? (
          <>
            <span className="text-muted/70">{answeredCount}</span>
            <span>/{theme.questions.length}</span>
          </>
        ) : (
          statText
        )}
      </span>

      {/* Shortcut hint */}
      <span className="text-[8px] font-mono text-muted/20 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {theme.index}
      </span>
    </motion.button>
  );
}

// ── Compact Fallback (<900px) ─────────────────────────────────────────────────

function CompactFallback({
  allTiles,
  themes,
  expandedId,
  scopingMode,
  onExpand,
}: {
  allTiles: ScopingTheme[];
  themes: ScopingTheme[];
  expandedId: string | null;
  scopingMode: "rapid" | "deep";
  onExpand: (id: string, index?: number) => void;
}) {
  const captures = useScopingStore((s) => s.themes);

  return (
    <div className="flex flex-col gap-2 px-4 py-6">
      {allTiles.map((tile) => {
        const capture = captures[tile.id];
        const status = capture?.status ?? "untouched";
        const modeQuestions = getQuestionsForMode(tile, scopingMode);
        const answeredCount = capture
          ? modeQuestions.filter(
              (q) => capture.questionResponses[q.id]?.answered === true,
            ).length
          : 0;
        const isContext = tile.id === "context";
        const themeIndex = isContext
          ? undefined
          : themes.findIndex((t) => t.id === tile.id);

        return (
          <button
            key={tile.id}
            onClick={() => onExpand(tile.id, themeIndex)}
            className={`flex items-center gap-3 rounded-lg border border-border p-3 text-left transition-all hover:border-border/80 ${
              expandedId === tile.id ? "border-accent/40" : ""
            } ${status === "deferred" ? "opacity-50" : ""}`}
          >
            <div
              className="flex items-center justify-center w-9 h-9 rounded-full border"
              style={{
                borderColor:
                  status === "captured" || status === "exploring"
                    ? tile.colorHex
                    : undefined,
                backgroundColor:
                  status === "captured" ? `${tile.colorHex}15` : undefined,
              }}
            >
              <span className="text-base">{tile.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <span
                className="text-xs font-semibold block truncate"
                style={{ color: tile.colorHex }}
              >
                {tile.name}
              </span>
              <span className="text-[9px] font-mono text-muted/50">
                {answeredCount > 0
                  ? `${answeredCount}/${modeQuestions.length} captured`
                  : `${modeQuestions.length} questions`}
              </span>
            </div>
            {status === "captured" && (
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
            )}
            {status === "exploring" && (
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Main Canvas ───────────────────────────────────────────────────────────────

export function ScopingCanvas() {
  const contextTile = getContextTile();
  const themes = getScopingThemes();
  const allTiles = [contextTile, ...themes];

  const expandedId = useScopingStore((s) => s.expandedThemeId);
  const focusedIndex = useScopingStore((s) => s.focusedThemeIndex);
  const clientName = useScopingStore((s) => s.clientName);
  const allCaptures = useScopingStore((s) => s.themes);
  const scopingMode = useScopingStore((s) => s.scopingMode);

  const expand = useScopingStore((s) => s.expandTheme);
  const collapse = useScopingStore((s) => s.collapseTheme);
  const setFocused = useScopingStore((s) => s.setFocusedTheme);
  const nextTheme = useScopingStore((s) => s.nextTheme);
  const prevTheme = useScopingStore((s) => s.prevTheme);
  const nextQuestion = useScopingStore((s) => s.nextQuestion);
  const prevQuestion = useScopingStore((s) => s.prevQuestion);
  const setScopeSignal = useScopingStore((s) => s.setScopeSignal);
  const setClientName = useScopingStore((s) => s.setClientName);
  const setScopingMode = useScopingStore((s) => s.setScopingMode);

  const fieldRef = useRef<HTMLDivElement>(null);
  const { width: containerWidth, height: containerHeight } =
    useContainerSize(fieldRef);
  const tilt = useParallaxTilt(fieldRef);

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getAnsweredCount = useCallback(
    (theme: ScopingTheme): number => {
      const capture = allCaptures[theme.id];
      if (!capture) return 0;
      return getQuestionsForMode(theme, scopingMode).filter(
        (q) => capture.questionResponses[q.id]?.answered === true,
      ).length;
    },
    [allCaptures, scopingMode],
  );

  const rapidHypothesis = useMemo(() => {
    if (scopingMode !== "rapid") return null;
    const topThemes = themes
      .map((theme) => {
        const capture = allCaptures[theme.id];
        if (!capture) return null;
        const score =
          (capture.priority === "high" ? 3 : capture.priority === "medium" ? 2 : capture.priority === "low" ? 1 : 0) +
          (capture.painLevel === "critical" ? 3 : capture.painLevel === "significant" ? 2 : capture.painLevel === "moderate" ? 1 : 0) +
          (capture.scopeSignal === "in" ? 1 : 0);
        return { theme, capture, score };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.theme.name);

    const inScopeCount = Object.values(allCaptures).filter(
      (c) => c.scopeSignal === "in",
    ).length;
    const highPainCount = Object.values(allCaptures).filter(
      (c) => c.painLevel === "critical" || c.painLevel === "significant",
    ).length;
    const answered = allTiles.reduce(
      (sum, tile) => sum + getAnsweredCount(tile),
      0,
    );
    const total = allTiles.reduce(
      (sum, tile) => sum + getQuestionsForMode(tile, "rapid").length,
      0,
    );
    const meeting2Agenda = themes
      .map((theme) => {
        const capture = allCaptures[theme.id];
        const unansweredDeep = getQuestionsForMode(theme, "deep").filter(
          (q) => capture?.questionResponses[q.id]?.answered !== true,
        );
        const score =
          (capture?.scopeSignal === "in" ? 3 : 0) +
          (capture?.painLevel === "critical" || capture?.painLevel === "significant" ? 2 : 0) +
          (capture?.priority === "high" ? 2 : capture?.priority === "medium" ? 1 : 0);
        return {
          theme,
          score,
          unanswered: unansweredDeep.length,
        };
      })
      .sort((a, b) => b.score - a.score)
      .filter((x) => x.unanswered > 0)
      .slice(0, 4);
    return {
      topThemes,
      inScopeCount,
      highPainCount,
      answered,
      total,
      meeting2Agenda,
    };
  }, [scopingMode, themes, allCaptures, allTiles, getAnsweredCount]);

  // Coverage stats
  const captured = Object.values(allCaptures).filter(
    (t) => t.status === "captured",
  ).length;
  const exploring = Object.values(allCaptures).filter(
    (t) => t.status === "exploring",
  ).length;

  // Orbital positions
  const orbital = useOrbitalPositions(
    containerWidth,
    containerHeight,
    themes,
    contextTile,
  );

  // All node positions for connection layer
  const allPositions = useMemo(() => {
    if (!orbital) return [];
    return [orbital.contextPos, ...orbital.themePositions];
  }, [orbital]);

  const allThemesForConnections = useMemo(
    () => [contextTile, ...themes],
    [contextTile, themes],
  );

  // Derive hovered theme for center hub crossfade
  const hoveredTheme = useMemo(() => {
    // When hovering, show that theme
    if (hoveredId && !expandedId) {
      return allTiles.find((t) => t.id === hoveredId) ?? null;
    }
    // When tabbing (focused), show focused theme if no hover and no panel open
    if (!hoveredId && !expandedId && focusedIndex >= 0 && focusedIndex < themes.length) {
      return themes[focusedIndex] ?? null;
    }
    return null;
  }, [hoveredId, expandedId, focusedIndex, themes, allTiles]);

  // Dependency highlighting — IDs whose lines should glow when a theme is hovered/focused
  const highlightedIds = useMemo(() => {
    const activeId = hoveredId ?? (focusedIndex >= 0 && focusedIndex < themes.length ? themes[focusedIndex]?.id : null);
    if (!activeId || expandedId) return new Set<string>();
    const deps = THEME_DEPENDENCIES[activeId] ?? [];
    return new Set(deps);
  }, [hoveredId, focusedIndex, themes, expandedId]);

  // Tunnel vision — set of IDs that should remain bright (hovered + its dependencies)
  const tunnelFocusIds = useMemo(() => {
    if (!hoveredId || expandedId) return null; // null = no tunnel effect
    const deps = THEME_DEPENDENCIES[hoveredId] ?? [];
    return new Set([hoveredId, ...deps]);
  }, [hoveredId, expandedId]);

  // Keyboard shortcuts (identical logic to original)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;

      if (expandedId) {
        if (e.key === "Escape") {
          e.preventDefault();
          collapse();
          return;
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          nextQuestion();
          return;
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          prevQuestion();
          return;
        }
        if (e.key.toLowerCase() === "i") {
          e.preventDefault();
          setScopeSignal(expandedId, "in");
          return;
        }
        if (e.key.toLowerCase() === "o") {
          e.preventDefault();
          setScopeSignal(expandedId, "out");
          return;
        }
        if (e.key.toLowerCase() === "e") {
          e.preventDefault();
          setScopeSignal(expandedId, "explore");
          return;
        }
      } else {
        if (e.key === "Tab") {
          e.preventDefault();
          if (e.shiftKey) prevTheme();
          else nextTheme();
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          const theme = themes[focusedIndex];
          if (theme) expand(theme.id);
          return;
        }
        if (e.key === "0") {
          e.preventDefault();
          expand(contextTile.id);
          return;
        }
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= 7) {
          e.preventDefault();
          setFocused(num - 1);
          const theme = themes[num - 1];
          if (theme) expand(theme.id);
          return;
        }
      }
    },
    [
      expandedId,
      focusedIndex,
      themes,
      contextTile,
      collapse,
      expand,
      nextTheme,
      prevTheme,
      nextQuestion,
      prevQuestion,
      setFocused,
      setScopeSignal,
    ],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const expandedTheme = expandedId
    ? allTiles.find((t) => t.id === expandedId)
    : null;

  // Small screen check
  const isSmallScreen = containerWidth > 0 && containerWidth < 900;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-[40vh] opacity-[0.03]"
        style={{
          background:
            "radial-gradient(ellipse 80% 100% at 50% -20%, #3B82F6 0%, transparent 70%)",
        }}
      />

      {/* Top bar */}
      <div className="relative z-40 bg-background/95 backdrop-blur-sm border-b border-border shrink-0">
        <div className="mx-auto max-w-7xl px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="font-serif text-lg text-foreground tracking-tight hover:text-accent transition-colors"
            >
              FTA
            </a>
            <span className="text-muted/30">/</span>
            <span className="text-xs text-muted">Pursuit</span>
            <span className="text-muted/30">/</span>
            <span className="text-xs text-foreground font-medium">
              Scoping Canvas
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center rounded border border-border/70 bg-surface-alt/30 p-0.5">
              <button
                onClick={() => setScopingMode("rapid")}
                className={`px-2.5 py-1 text-[10px] font-mono rounded transition-colors ${
                  scopingMode === "rapid"
                    ? "bg-surface text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Rapid 12
              </button>
              <button
                onClick={() => setScopingMode("deep")}
                className={`px-2.5 py-1 text-[10px] font-mono rounded transition-colors ${
                  scopingMode === "deep"
                    ? "bg-surface text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Deep Dive
              </button>
            </div>
            <span className="text-[10px] font-mono text-muted">
              {captured}/7 captured
              {exploring > 0 && ` \u00b7 ${exploring} exploring`}
            </span>
            <ScopingExport />
          </div>
        </div>
      </div>

      {/* Orbital field */}
      <div
        ref={fieldRef}
        className="relative flex-1 min-h-0"
        style={{
          perspective: "1200px",
        }}
      >
        {isSmallScreen ? (
          <CompactFallback
            allTiles={allTiles}
            themes={themes}
            expandedId={expandedId}
            scopingMode={scopingMode}
            onExpand={(id, index) => {
              if (index !== undefined) setFocused(index);
              expand(id);
            }}
          />
        ) : orbital ? (
          <div
            className="absolute inset-0"
            style={{
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: "transform 0.15s ease-out",
              transformStyle: "preserve-3d",
            }}
          >
            {/* SVG connections */}
            <ConnectionLayer
              cx={orbital.cx}
              cy={orbital.cy}
              hubRadius={60}
              positions={allPositions}
              themes={allThemesForConnections}
              expandedId={expandedId}
              hoveredId={hoveredId}
              highlightedIds={highlightedIds}
              captures={allCaptures}
              width={containerWidth}
              height={containerHeight}
            />

            {/* Center hub */}
            <CenterHub
              cx={orbital.cx}
              cy={orbital.cy}
              captured={captured}
              clientName={clientName}
              setClientName={setClientName}
              hoveredTheme={hoveredTheme}
            />

            {/* Context node (12 o'clock) */}
            <OrbitalNode
              theme={contextTile}
              x={orbital.contextPos.x}
              y={orbital.contextPos.y}
              index={0}
              isFocused={false}
              isExpanded={expandedId === contextTile.id}
              isPanelOpen={expandedId !== null}
              isTunnelDimmed={tunnelFocusIds !== null && !tunnelFocusIds.has(contextTile.id)}
              status={allCaptures[contextTile.id]?.status ?? "untouched"}
              painLevel={allCaptures[contextTile.id]?.painLevel ?? null}
              answeredCount={
                getAnsweredCount(contextTile)
              }
              onExpand={() => expand(contextTile.id)}
              onHover={() => setHoveredId(contextTile.id)}
              onLeave={() => setHoveredId(null)}
            />

            {/* Theme nodes */}
            {themes.map((theme, i) => (
              <OrbitalNode
                key={theme.id}
                theme={theme}
                x={orbital.themePositions[i].x}
                y={orbital.themePositions[i].y}
                index={i + 1}
                isFocused={focusedIndex === i && !expandedId}
                isExpanded={expandedId === theme.id}
                isPanelOpen={expandedId !== null}
                isTunnelDimmed={tunnelFocusIds !== null && !tunnelFocusIds.has(theme.id)}
                status={allCaptures[theme.id]?.status ?? "untouched"}
                painLevel={allCaptures[theme.id]?.painLevel ?? null}
                answeredCount={
                  getAnsweredCount(theme)
                }
                onExpand={() => {
                  setFocused(i);
                  expand(theme.id);
                }}
                onHover={() => setHoveredId(theme.id)}
                onLeave={() => setHoveredId(null)}
              />
            ))}
          </div>
        ) : null}

        {/* Keyboard hints */}
        {!isSmallScreen && (
          <motion.div
            className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-6 text-[10px] text-muted/40 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-alt/50 text-muted/60">
                Tab
              </kbd>{" "}
              navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-alt/50 text-muted/60">
                Enter
              </kbd>{" "}
              expand
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-alt/50 text-muted/60">
                0
              </kbd>{" "}
              context
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-alt/50 text-muted/60">
                1
              </kbd>
              -
              <kbd className="px-1.5 py-0.5 rounded bg-surface-alt/50 text-muted/60">
                7
              </kbd>{" "}
              themes
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-alt/50 text-muted/60">
                Esc
              </kbd>{" "}
              close
            </span>
          </motion.div>
        )}

        {rapidHypothesis && !expandedTheme && (
          <div className="absolute left-4 top-4 z-20 w-[320px] rounded-lg border border-border/80 bg-background/85 p-3 backdrop-blur-sm">
            <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-muted/50">
              Initial Scope Hypothesis
            </div>
            <p className="text-[11px] font-mono text-muted/80 mb-2">
              {rapidHypothesis.answered}/{rapidHypothesis.total} rapid questions captured.
            </p>
            <p className="text-[11px] font-mono text-foreground/90 mb-2">
              Priority themes: {rapidHypothesis.topThemes.length > 0 ? rapidHypothesis.topThemes.join(", ") : "TBD"}.
            </p>
            <p className="text-[11px] font-mono text-muted/80">
              Scope signal: {rapidHypothesis.inScopeCount} in-scope themes, {rapidHypothesis.highPainCount} high-pain areas.
            </p>
            <div className="mt-2 border-t border-border/70 pt-2">
              <p className="mb-1 text-[10px] font-mono uppercase tracking-wider text-muted/50">
                Meeting 2 Agenda
              </p>
              {rapidHypothesis.meeting2Agenda.length > 0 ? (
                <div className="space-y-1">
                  {rapidHypothesis.meeting2Agenda.map((item) => (
                    <p key={item.theme.id} className="text-[11px] font-mono text-muted/80">
                      {item.theme.name} ({item.unanswered} deep questions)
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] font-mono text-muted/70">
                  Deep-dive coverage is already complete for priority themes.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Expanded theme panel */}
      <AnimatePresence>
        {expandedTheme && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={collapse}
              className="fixed inset-0 z-40 bg-black/40"
            />
            <ThemePanel theme={expandedTheme} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
