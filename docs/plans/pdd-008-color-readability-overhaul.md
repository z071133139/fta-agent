# PDD-008: Color & Readability Overhaul

**Scope:** Fix systemic readability failures across all workspace components — minimum font sizes, contrast ratios, token consolidation, and process flow canvas treatment
**Priority:** High — readability is blocking real usage and testing
**Depends on:** None (pure visual/CSS changes, no new features)

---

## Problem — Rachel

The product has a readability crisis. After extended testing, the product owner reports that screens are "really hard to read." A full audit confirms this is systemic, not isolated:

- **8px and 9px text** is used for semantically critical data: status badges, system tags, gateway labels, SP identifiers, fit ratings, cross-PA chips. These are not decorative — they drive the fit-gap analysis workflow.
- **WCAG AA contrast failures** at every level. `text-muted` (#94A3B8 on #0F172A) is only 3.5:1 — already below AA for normal text. Then we compound this with `/50` and `/30` opacity modifiers, dropping to 1.8:1 and 1.4:1.
- **Process flow nodes are invisible.** Slate-800 nodes on slate-900 canvas, with slate-500 system badges on slate-700 backgrounds (2.4:1 contrast). The swimlane labels are 9px rotated text.
- **Two parallel color systems** make fixes fragile. Half the codebase uses CSS tokens, half uses hardcoded hex or raw `slate-*` classes with identical values.

This isn't a polish issue — it's a functionality blocker. A consultant can't use a process flow they can't read. They can't scan a requirements table where badge text is 9px.

### What's NOT broken

- The dark-mode aesthetic itself is correct for the audience. Finance professionals expect density and authority.
- The color palette (slate, blue accent, amber/emerald/red semantics) is well-chosen.
- Components that use CSS tokens properly (PreflightScreen, AnnotatedTable structure) are the most maintainable.
- The layout density is appropriate — the problem is contrast and sizing, not spacing.

---

## Scope — Rachel

### In

| # | Deliverable | Purpose |
|---|-------------|---------|
| 1 | Minimum font size enforcement (10px floor, with 11px for data) | Eliminate all 8px and 9px text |
| 2 | Contrast ratio fixes for text-muted and all opacity variants | Meet WCAG AA (4.5:1) for meaningful text |
| 3 | Process flow canvas contrast overhaul | Readable nodes, edges, labels, system badges |
| 4 | Token consolidation — migrate all hardcoded hex to CSS variables | Single system for future theming |
| 5 | Badge system standardization | Consistent sizing, contrast, token usage across all badge types |

### Out

- Light mode / theme switching (future — but token consolidation makes it possible)
- Layout changes (spacing, sizing, positioning unchanged)
- New features or components
- Font family changes (DM Sans / JetBrains Mono / Instrument Serif stay)
- Color palette changes (same hues, adjusted values for contrast)

---

## Design System Updates — Michelle

### The Core Insight

The current palette has **too narrow a luminance range.** Everything lives between slate-900 (#0F172A, L=7) and slate-400 (#94A3B8, L=40). That's a 33-point spread trying to encode 6+ semantic levels (background → surface → surface-alt → border → muted → foreground). Compare: a well-calibrated dark theme needs at least a 70-point spread.

The fix isn't "make everything lighter" — it's **widen the usable range** by:
1. Pushing muted text UP (brighter) so it meets contrast minimums
2. Adding an intermediate "secondary" text token between muted and foreground
3. Making node/card surfaces more distinct from the canvas
4. Establishing firm minimums for font size and contrast

### Updated Token Palette

```css
/* ── Backgrounds ─────────────────────────────────────────── */
--color-background:    #0F172A;  /* slate-900 — unchanged, canvas/page */
--color-surface:       #1E293B;  /* slate-800 — unchanged, cards/panels */
--color-surface-alt:   #334155;  /* slate-700 — unchanged, hover/active */
--color-elevated:      #3D4F6A;  /* NEW — raised surfaces: flow nodes, prominent cards */

/* ── Borders ─────────────────────────────────────────────── */
--color-border:        #475569;  /* slate-600 — unchanged */
--color-border-strong: #64748B;  /* NEW — visible separators, node outlines */

/* ── Text ────────────────────────────────────────────────── */
--color-foreground:    #F1F5F9;  /* slate-100 — unchanged, primary */
--color-secondary:     #CBD5E1;  /* NEW (slate-300) — data cells, secondary content */
--color-muted:         #94A3B8;  /* slate-400 — RESTRICTED: decorative only, never for data */
--color-faint:         #64748B;  /* NEW — explicit token for intentionally dim elements */

/* ── Semantic (unchanged) ────────────────────────────────── */
--color-accent:        #3B82F6;  /* blue-500 */
--color-success:       #10B981;  /* emerald-500 */
--color-warning:       #F59E0B;  /* amber-500 */
--color-error:         #EF4444;  /* red-500 */
```

### Key Changes Explained

| Token | Old Usage | New Rule |
|-------|-----------|----------|
| `text-muted` (#94A3B8) | Used for everything — headers, data, metadata, badges | **Decorative only.** Timestamps, attribution, keyboard hints. Never for data the consultant needs to read. |
| `text-secondary` (#CBD5E1) — NEW | Didn't exist | **Data text.** Table cells, badge labels, requirement text, node labels. 5.8:1 contrast on background. |
| `bg-elevated` (#3D4F6A) — NEW | Didn't exist | **Raised elements.** Process flow nodes, prominent cards. Clearly distinct from canvas (#0F172A) and surface (#1E293B). |
| `border-strong` (#64748B) — NEW | Didn't exist | **Visible outlines.** Flow node borders, table row separators that need to be seen. |

### Contrast Ratios on `#0F172A` Background

| Token | Value | Contrast | WCAG AA (normal text) | WCAG AA (large text) |
|-------|-------|----------|----------------------|---------------------|
| `foreground` | #F1F5F9 | 13.5:1 | Pass | Pass |
| `secondary` (NEW) | #CBD5E1 | 8.1:1 | Pass | Pass |
| `muted` | #94A3B8 | 3.8:1 | Fail | Pass (14px+ bold or 18px+) |
| `faint` (NEW) | #64748B | 2.4:1 | Fail | Fail |

**Rule:** Any text that conveys information the consultant needs must use `text-secondary` or `text-foreground`. `text-muted` is reserved for decorative/ambient elements (timestamps, attribution). `text-faint` is for intentionally invisible affordances (keyboard hints shown only on hover, etc.).

### Font Size Rules

| Minimum | Usage |
|---------|-------|
| **11px** | Data text — table cells, badge labels, node labels, requirement text |
| **10px** | UI chrome — column headers (uppercase), section labels, metadata |
| **9px** | Decorative only — keyboard hints that appear on hover/focus |
| **8px** | **Banned.** No text at 8px anywhere in the app. |

### Badge System Standardization

All badges across the app should follow one pattern:

```
Font: 10px JetBrains Mono, uppercase
Padding: 2px 6px
Border-radius: 4px
Background: semantic-color at 15% opacity
Text: semantic-color at 100%
Border: semantic-color at 25% opacity, 1px
```

This replaces the current inconsistent mix of 8px/9px badges with varying padding and opacity patterns.

---

## Process Flow Canvas Treatment — Michelle

The process flow has the worst readability because it compounds every problem: tiny text, low contrast, dark-on-dark nodes, and invisible edges.

### Node Redesign

```
BEFORE                              AFTER
┌─────────────────────┐             ┌─────────────────────┐
│ bg: #1E293B         │             │ bg: #3D4F6A         │  ← elevated
│ border: rgba(71,85, │             │ border: #64748B     │  ← border-strong
│   105,0.7)          │             │                     │
│ text: #F1F5F9 11px  │             │ text: #F1F5F9 12px  │  ← bumped
│ sys: #64748B 8px    │             │ sys: #CBD5E1 10px   │  ← secondary, bigger
│ on #334155          │             │ on #475569          │  ← surface-alt bg
└─────────────────────┘             └─────────────────────┘
```

| Element | Before | After |
|---------|--------|-------|
| Node background | `#1E293B` (surface) | `#3D4F6A` (elevated) — clearly raised from canvas |
| Node border | `rgba(71,85,105,0.7)` | `#64748B` (border-strong) — fully opaque, visible |
| Node label | `#F1F5F9` at 11px | `#F1F5F9` at 12px |
| System badge text | `#64748B` at 8px on `#334155` | `#CBD5E1` at 10px on `#475569` |
| System badge contrast | ~2.4:1 | ~4.5:1 |
| Gateway label | `#94A3B8` at 8px | `#CBD5E1` at 10px |
| Swimlane label | `#94A3B8` at 9px | `#CBD5E1` at 11px |
| Edge stroke | `#475569` at 1.5px | `#64748B` at 1.5px — matches border-strong |
| Edge condition label | `#94A3B8` at 9px | `#CBD5E1` at 10px |
| Overlay count badge | `#F59E0B`, 8px | `#F59E0B`, 10px — same color, larger |

### Swimlane Band Treatment

Current: `rgba(15,23,42,0.3)` — nearly invisible alternating bands.

After: `rgba(30,41,59,0.25)` (surface at 25%) with `border-top: 1px solid rgba(71,85,105,0.4)` — slightly more visible separation between lanes. The lanes should create a subtle horizontal striping effect, not be invisible.

---

## Token Migration Strategy — David

### The Problem

Two parallel color systems exist:

| System | Files | Pattern |
|--------|-------|---------|
| **CSS tokens** | AnnotatedTable, PreflightScreen, ProcessFlowIndex (partial), BuilderChatPanel (partial), page.tsx | `text-muted`, `bg-surface`, `text-foreground` |
| **Raw values** | COADesignWorkbench, CompletedAnalysisView, InlineReportPanel, FlowNodeLayer, FlowEdgeLayer, BusinessRequirementsTable (inline styles) | `text-slate-300`, `bg-slate-800`, `style={{ color: "#94A3B8" }}` |

### Migration Rules

1. **Tailwind `slate-*` classes → CSS tokens:**
   - `text-slate-100` / `text-slate-200` → `text-foreground`
   - `text-slate-300` → `text-secondary` (NEW)
   - `text-slate-400` → `text-muted` (decorative) or `text-secondary` (data)
   - `text-slate-500` → `text-muted` or `text-faint`
   - `bg-slate-900` → `bg-background`
   - `bg-slate-800` → `bg-surface`
   - `bg-slate-700` → `bg-surface-alt`
   - `border-slate-700` / `border-slate-600` → `border-border`

2. **Hardcoded hex in inline styles → CSS tokens (where possible):**
   - FlowNodeLayer and FlowEdgeLayer use inline `style={}` objects because React Flow custom nodes require it. These can reference CSS variables via `var(--color-elevated)` in the style object, or we define constants that import from a shared config.
   - BusinessRequirementsTable badge colors are inline due to dynamic mapping. Use a `BADGE_COLORS` config object with semantic token values.

3. **Hardcoded semantic colors → tokens:**
   - `text-[#10B981]` → `text-success`
   - `text-[#EF4444]` → `text-error`
   - `text-[#F59E0B]` → `text-warning`
   - `bg-blue-600` / `bg-blue-500` → `bg-accent`
   - `border-blue-500` → `border-accent`

### Inline Style Strategy for React Flow Components

FlowNodeLayer and FlowEdgeLayer use inline `style={}` because React Flow positions custom nodes absolutely. We can't use Tailwind classes for position-dependent styles, but we CAN for colors.

**Approach:** Define a `FLOW_TOKENS` constant object that reads CSS custom properties at component mount, then reference it in inline styles:

```typescript
// flow-tokens.ts
export const FLOW_TOKENS = {
  nodeBg: 'var(--color-elevated)',
  nodeBorder: 'var(--color-border-strong)',
  nodeText: 'var(--color-foreground)',
  nodeMuted: 'var(--color-secondary)',
  edgeStroke: 'var(--color-border-strong)',
  edgeLabel: 'var(--color-secondary)',
  // ... etc
} as const;
```

CSS custom properties work in inline `style={}` objects: `style={{ backgroundColor: 'var(--color-elevated)' }}` is valid and reactive to theme changes.

### New CSS Variables to Add to globals.css

```css
--color-elevated: #3D4F6A;
--color-border-strong: #64748B;
--color-secondary: #CBD5E1;
--color-faint: #64748B;
```

Plus Tailwind utility registration:
```css
@utility bg-elevated { background-color: var(--color-elevated); }
@utility text-secondary { color: var(--color-secondary); }
@utility text-faint { color: var(--color-faint); }
@utility border-strong { border-color: var(--color-border-strong); }
```

---

## State Machine — David

No state changes — this is a pure rendering/styling change. All component behavior, store logic, and data flow remain identical.

---

## Files to Modify — David

### Phase 1: Foundation (CSS + tokens)

| File | Changes |
|------|---------|
| `web/src/app/globals.css` | Add 4 new CSS variables + 4 Tailwind utilities |

### Phase 2: Process Flow (highest impact, most isolated)

| File | Changes |
|------|---------|
| `web/src/components/workspace/process-flow/FlowNodeLayer.tsx` | Node bg → elevated, borders → border-strong, font sizes up, system badge fix, use `var()` refs |
| `web/src/components/workspace/process-flow/FlowEdgeLayer.tsx` | Edge stroke → border-strong, label text → secondary at 10px, use `var()` refs |
| `web/src/components/workspace/ProcessFlowMap.tsx` | Overlay panel — any hardcoded hex → tokens |

### Phase 3: Tables & Workbench (wide impact)

| File | Changes |
|------|---------|
| `web/src/components/workspace/AnnotatedTable.tsx` | `text-muted/30` → `text-faint`, header text → 11px, badge text → 10px |
| `web/src/components/workspace/COADesignWorkbench.tsx` | Full token migration: all `slate-*` → semantic tokens, font size bumps |
| `web/src/components/workspace/BusinessRequirementsTable.tsx` | Badge font sizes 9px→10px, 8px cross-PA chips→10px, OPS badge contrast fix, token migration |
| `web/src/components/workspace/CompletedAnalysisView.tsx` | Token migration (`slate-*` → tokens), markdown table header size bump |
| `web/src/components/workspace/InlineReportPanel.tsx` | Token migration, metadata contrast fix |

### Phase 4: Builder & Index (smaller scope)

| File | Changes |
|------|---------|
| `web/src/components/workspace/ProcessFlowIndex.tsx` | SP ID 9px→10px, badge text 9px→10px, hardcoded hex→tokens |
| `web/src/components/workspace/ProcessFlowBuilder.tsx` | Toggle 9px→10px, action button sizes, hardcoded hex→tokens |
| `web/src/components/workspace/flow-builder/BuilderChatPanel.tsx` | "Flow updated" 9px→10px, keyboard hint token fix |
| `web/src/components/workspace/PreflightScreen.tsx` | Live badge 9px→10px (minor) |

---

## Key Design Decisions — All Three

1. **Don't change the palette, widen the range** (Michelle) — The slate base, blue accent, and amber/emerald/red semantics are correct. The problem is that meaningful text was assigned to `text-muted` which doesn't have enough contrast. Adding `text-secondary` (slate-300, 8.1:1) solves this without changing the vibe.

2. **Elevated surface for flow nodes** (Michelle) — A new `--color-elevated` (#3D4F6A) sits between surface-alt (#334155) and border (#475569). This gives flow nodes a clearly raised appearance without going "light mode." The node becomes visually distinct from the canvas without disrupting the dark aesthetic.

3. **CSS `var()` in inline styles** (David) — React Flow requires inline positioning, but colors can use `var(--color-*)` references. This keeps the entire component tree reactive to token changes without a separate token-import system.

4. **`text-muted` becomes decorative-only** (Rachel) — This is the highest-impact rule change. Every data-bearing usage of `text-muted` migrates to `text-secondary`. Muted is reserved for timestamps, attribution, and ambient labels. This single rule eliminates most contrast failures.

5. **10px minimum for meaningful text, 11px for data** (Michelle) — Eliminates 100+ instances of 8px and 9px text conveying real information. The density reduction is minimal (1-2px per element) but the readability gain is massive.

6. **Phase the rollout by isolation** (Rachel) — Start with process flows (most visible problem, most isolated component). Then tables/workbench (widest impact). Then builder/index (smallest scope). Each phase is independently verifiable.

7. **No opacity modifiers on text tokens** (Michelle) — Ban `text-muted/30`, `text-muted/50`, `text-secondary/70` etc. If text needs to be dimmer, use the next-lower semantic token (`secondary` → `muted` → `faint`). Opacity on text is an anti-pattern that makes contrast unpredictable.

---

## Verification — Rachel

1. `pnpm --filter web build` — clean after each phase
2. **Process flow (Phase 2):** Navigate to any process flow (d-004-03a). Verify:
   - Nodes are clearly raised from canvas background
   - System badges (SAP ERP, SAP FICO) are readable at arm's length
   - Gateway labels ("Insurance 3-Way Match?") are readable
   - Swimlane labels are readable without squinting
   - Edge condition labels ("Yes" / "No") are visible
   - Status stripes (blue/amber/red left border) still visually distinct
3. **Tables (Phase 3):** Navigate to AnnotatedTable (d-001-03 RACI), BusinessRequirementsTable (d-004-04). Verify:
   - Column headers are readable (not tiny uppercase)
   - Badge text (Tag, Segment, Fit, Status) is readable
   - Empty cell dashes are visible but clearly secondary
   - No contrast failures on any badge type
4. **COA Workbench (Phase 3):** Navigate to d-005-02. Verify all 4 tabs readable, decision cards clear, inline editing contrast adequate
5. **ProcessFlowIndex (Phase 4):** All SP IDs, stats, and badges readable
6. **ProcessFlowBuilder (Phase 4):** Mock/Live toggle, Accept/Discard buttons readable
7. **Spot check:** No remaining 8px text anywhere. No `text-muted` used for data content. No hardcoded `#64748B`, `#94A3B8`, `slate-300`, `slate-400` in any modified file.
8. **Regression:** Existing functionality unchanged — hover states, selections, animations, agent streaming all work as before
