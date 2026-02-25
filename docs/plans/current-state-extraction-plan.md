# Current State Extraction — Integration Plan

> Created: 2026-02-23 (Session 019 planning)
> Status: Designed, not built
> Depends on: Workshop Mode (complete), Stream A (partial)

## Context

FTA has a complete target-state reference library (20 PAs, 324 BRs, 4 process flows, fit/gap ratings, agentic bridges) and a fully operational Workshop Mode for live capture. What's missing: **a way to ingest what the client already has** — SAP config exports, transaction logs, close checklists, process documents — and turn it into structured evidence that enriches the existing workspaces.

Two specs were provided (Config Extractor, Process Extractor) describing standalone CLI tools. After red-teaming, the design was revised to integrate directly into FTA:

### Design Principles (from red team)
1. **No standalone CLIs** — extraction is an agent capability inside FTA
2. **No YAML intermediate** — extracted data goes to DuckDB via DataEngine
3. **No parallel data hierarchy** — extend existing types with `evidence?` fields
4. **Mock data first** — prove the UI integration before building real extractors
5. **Workshop gains Validation Mode** — confirm/dispute pattern when evidence exists
6. **Coverage is a lens, not a separate workspace** — shown on Process Inventory
7. **Two separate tool sets** — Config extraction for GL Design Coach, Process extraction for Functional Consultant

### Source Specs
- `/Users/z0711/Downloads/FTA_Config_Extractor_MVP_Spec.md`
- `/Users/z0711/Downloads/FTA_Process_Extractor_MVP_Spec.md`

---

## Build Order

| Session | What | Stream |
|---------|------|--------|
| **E1+E2** | Type extensions + mock extraction data + evidence UI (badges, coverage lens, detail panel) | Frontend |
| **E3** | Workshop Validation Mode (C/D/? keys, validation tracking, evidence-backed suggestions) | Frontend |
| **E4+E5** | Config extraction backend (CSV→DuckDB) + behavioral extraction (log analysis) | Backend |
| **E6** | Document ingestion (LLM-powered) + API wiring + SSE progress | Backend |

---

## E1+E2: Types, Mock Data, Evidence UI

### Step 1: Extend existing types in `web/src/lib/mock-data.ts`

Add new types (no parallel hierarchy — these attach to existing objects):

```typescript
// ── Extraction Evidence ───────────────────────────────────────────────────
export type EvidenceSource = "sap_config" | "transaction_log" | "close_checklist" | "process_document" | "interview";
export type EvidenceConfidence = "high" | "medium" | "low";

export interface ExtractionEvidence {
  evidence_id: string;
  source_type: EvidenceSource;
  source_file?: string;           // "T001_company_codes.csv"
  source_section?: string;        // "Table T001, rows 1-4"
  extracted_text: string;         // raw extracted content
  summary: string;                // one-line human-readable
  confidence: EvidenceConfidence;
  extracted_at: string;           // ISO timestamp
  pa_id?: string;
  sp_id?: string;
  validated?: boolean;            // confirmed in workshop
  disputed?: boolean;             // overridden in workshop
  dispute_notes?: string;
}
```

Extend existing interfaces (add optional fields, no breaking changes):

```typescript
// FitGapAnalysis — add evidence array
export interface FitGapAnalysis {
  // ... existing fields unchanged ...
  evidence?: ExtractionEvidence[];  // NEW
}

// BusinessRequirement — add current state evidence
export interface BusinessRequirement {
  // ... existing fields unchanged ...
  current_state_evidence?: ExtractionEvidence[];  // NEW
}

// ProcessOverlay — add "extraction" source + evidence link
export interface ProcessOverlay {
  // ... existing fields ...
  source: "agent_elicited" | "gl_finding" | "consultant" | "extraction";  // ADD "extraction"
  evidence?: ExtractionEvidence;  // NEW
}

// ProcessInventoryNode — add extraction coverage
export interface ProcessInventoryNode {
  // ... existing fields unchanged ...
  extraction_coverage?: {  // NEW
    config: number;
    behavioral: number;
    document: number;
    total: number;
    confidence: EvidenceConfidence;
    last_extracted: string;
  };
}
```

### Step 2: Create mock extraction data — `web/src/lib/mock-extractions.ts`

New file containing:

1. **`MOCK_EVIDENCE: ExtractionEvidence[]`** — ~10-12 evidence items across PA-02, PA-03, PA-05, PA-09, PA-13 covering all source types (sap_config, transaction_log, close_checklist, process_document). Each with realistic extracted_text and summary.

2. **`BR_EVIDENCE_MAP: Record<string, string[]>`** — Maps ~15 existing BR IDs to evidence IDs. Used to wire evidence into BR rendering without modifying mock-requirements.ts directly.

3. **`PA_EXTRACTION_COVERAGE: Record<string, ProcessInventoryNode["extraction_coverage"]>`** — Per-PA coverage summary computed from evidence counts.

4. **`MOCK_CONFIG_EXTRACTION`** — Structured SAP config data (company codes, document types, GL account groups, fiscal year variant) for Acme Insurance.

5. **`MOCK_BEHAVIORAL_EXTRACTION`** — Transaction code frequencies, posting patterns, close activities.

#### Example mock evidence items:

```typescript
// PA-02: GL config evidence
{
  evidence_id: "ev-001",
  source_type: "sap_config",
  source_file: "T001_company_codes.csv",
  source_section: "Rows 1-3",
  extracted_text: "Company codes 1000, 1100, 2000 configured with USD. Bermuda entity (2000) uses separate number ranges.",
  summary: "3 company codes across 2 countries — Bermuda entity may require separate ledger group",
  confidence: "high",
  extracted_at: "2026-02-20T14:30:00Z",
  pa_id: "PA-02",
}

// PA-02: Behavioral evidence
{
  evidence_id: "ev-002",
  source_type: "transaction_log",
  source_file: "BKPF_FY2025.csv",
  source_section: "Aggregate analysis",
  extracted_text: "14,200 GL postings via FB50 (manual). 3,100 parked documents via FBV0. 1,800 reversals via FBRA — reversal rate 12.7% indicates data quality issues.",
  summary: "12.7% reversal rate on GL postings suggests manual entry quality issues — automation target",
  confidence: "high",
  extracted_at: "2026-02-20T15:10:00Z",
  pa_id: "PA-02",
}

// PA-05: Document evidence
{
  evidence_id: "ev-003",
  source_type: "process_document",
  source_file: "Ceded_Reinsurance_SOP_v3.2.docx",
  source_section: "Section 4.2 — Treaty Setup",
  extracted_text: "Current process: Treaty terms are keyed manually from broker slips into ReinsHub. Average 45 minutes per treaty. Error rate ~8% on attachment point entry.",
  summary: "Manual treaty data entry from broker slips — 45 min/treaty, 8% error rate on attachment points",
  confidence: "medium",
  extracted_at: "2026-02-20T16:00:00Z",
  pa_id: "PA-05",
  sp_id: "SP-05.1",
}

// PA-09: Config evidence
{
  evidence_id: "ev-004",
  source_type: "sap_config",
  source_file: "T003_document_types.csv",
  source_section: "Row 4 (KR)",
  extracted_text: "Document type KR (vendor invoice) uses number range 04. Tolerance group CTRL allows up to $10,000 without additional approval.",
  summary: "Vendor invoice tolerance at $10K — may need tightening for SOX compliance in new ERP",
  confidence: "high",
  extracted_at: "2026-02-20T14:45:00Z",
  pa_id: "PA-09",
}

// PA-09: Behavioral evidence
{
  evidence_id: "ev-005",
  source_type: "transaction_log",
  source_file: "BKPF_FY2025.csv",
  source_section: "F-53 analysis",
  extracted_text: "5,200 vendor payments in FY2025. 340 manual commission payments to 47 distinct agents/brokers. Average 7.2 commission payments per broker per year.",
  summary: "340 manual commission payments/year across 47 brokers — high automation potential",
  confidence: "high",
  extracted_at: "2026-02-20T15:30:00Z",
  pa_id: "PA-09",
  sp_id: "SP-09.2",
}

// PA-13: Close checklist evidence
{
  evidence_id: "ev-006",
  source_type: "close_checklist",
  source_file: "Monthly_Close_Checklist_2025.xlsx",
  source_section: "Day 1 Tasks",
  extracted_text: "Bank reconciliation: J. Chen, 2 hours. 4 bank accounts. Manual matching against bank statement PDF. Average 12 unmatched items per month.",
  summary: "Manual bank recon — 4 accounts, 2 hours/month, 12 avg unmatched items",
  confidence: "high",
  extracted_at: "2026-02-20T16:20:00Z",
  pa_id: "PA-13",
  sp_id: "SP-13.1",
}

// PA-03: Document evidence
{
  evidence_id: "ev-007",
  source_type: "process_document",
  source_file: "Premium_Accounting_Process_Notes.pdf",
  source_section: "Page 3 — GWP Recording",
  extracted_text: "Guidewire PolicyCenter generates daily bordereau files. Premium accountant manually reviews and posts aggregate journal entry to GL next morning. No automated subledger reconciliation.",
  summary: "GWP posted as daily aggregate JE from Guidewire bordereau — no auto-recon to subledger",
  confidence: "medium",
  extracted_at: "2026-02-20T16:40:00Z",
  pa_id: "PA-03",
  sp_id: "SP-03.1",
}
```

#### BR→Evidence mapping:
```typescript
export const BR_EVIDENCE_MAP: Record<string, string[]> = {
  "BR-02.1.01": ["ev-001", "ev-002"],  // JE processing — config + reversal rate
  "BR-02.1.03": ["ev-002"],            // Multi-basis — reversal analysis
  "BR-05.1.01": ["ev-003"],            // Treaty master — manual keying SOP
  "BR-05.1.02": ["ev-003"],            // Facultative certs — same SOP
  "BR-09.1.01": ["ev-004"],            // Vendor invoice — tolerance config
  "BR-09.2.01": ["ev-005"],            // Commission payments — volume data
  "BR-13.1.01": ["ev-006"],            // Bank recon — close checklist
  "BR-03.1.01": ["ev-007"],            // GWP recording — process doc
};
```

### Step 3: Evidence badges on BusinessRequirementsTable

**File:** `web/src/components/workspace/BusinessRequirementsTable.tsx`

- Import `BR_EVIDENCE_MAP` and `MOCK_EVIDENCE` from mock-extractions
- On requirement rows where `BR_EVIDENCE_MAP[req.id]` has entries, render evidence pill badge: `[EV N]` in accent blue, next to existing status/tag badges
- Click evidence badge → opens EvidenceDetailPanel (Step 5)
- In FitGapCard: if evidence exists, show source attribution under each ERP assessment

### Step 4: Coverage lens on Process Inventory

**File:** `web/src/components/workspace/ProcessInventoryGraph.tsx`

- Import `PA_EXTRACTION_COVERAGE` from mock-extractions
- Add toggle button in top controls: "Evidence Coverage" (eye icon)
- When active: each PA node shows mini stacked bar (config=blue, behavioral=purple, document=teal) + total count
- PAs with zero evidence: "No extraction data" in muted text
- PAs with low confidence: amber border
- This is a **lens on existing view**, not a separate workspace

### Step 5: New component — EvidenceDetailPanel

**New file:** `web/src/components/workspace/EvidenceDetailPanel.tsx`

Slide-out panel (right side, 360px, same pattern as WorkshopHistory):
- Source file name + section (mono font)
- Extracted text (quoted block, mono)
- Confidence badge: high=emerald, medium=blue, low=slate
- Summary line
- Validation status: "Unvalidated" / "Confirmed" (emerald) / "Disputed" (red + notes)
- Workshop mode: Confirm (C) and Dispute (D) buttons visible

Props: `evidence: ExtractionEvidence[], onConfirm?: (id) => void, onDispute?: (id, notes) => void`

Reused by BusinessRequirementsTable and ProcessFlowMap.

---

## E3: Workshop Validation Mode

### Step 6: Workshop store extensions

**File:** `web/src/lib/workshop-store.ts`

```typescript
// Add to WorkshopState:
validatedEvidence: Map<string, "confirmed" | "disputed">;
disputeNotes: Map<string, string>;

confirmEvidence: (evidenceId: string) => void;
disputeEvidence: (evidenceId: string, notes: string) => void;
```

**File:** `web/src/lib/workshop-persistence.ts` — serialize/deserialize validation Maps.

### Step 7: Validation keyboard shortcuts

**File:** `web/src/hooks/useWorkshopKeyboard.ts`

When EvidenceDetailPanel open + evidence focused:
- `C` → confirm (emerald flash)
- `D` → dispute (opens notes textarea)
- Guard: only active when evidence panel open. No conflict with R/N/G/A.

### Step 8: Validation Mode UX in BusinessRequirementsTable

When workshop active AND PA has extraction evidence:
- Top banner: "Validation Mode — N evidence items to review for PA-XX"
- Unvalidated evidence items show amber dot
- Agent suggestions become evidence-backed (show `summary` from evidence)
- Confirmed = emerald check. Disputed = red X with notes on hover.

### Step 9: Validation summary in WorkshopHistory + export

- Session cards: "Evidence: N confirmed, N disputed, N pending"
- Export JSON includes `validationRecord[]`

---

## E4+E5: Backend Extraction (No LLM)

### Config Extraction (GL Design Coach tools)

**New file:** `src/fta_agent/data/config_schemas.py`
- `CompanyCodeRecord`, `DocumentTypeRecord`, `GLAccountGroupRecord`, `FiscalYearVariantRecord`, `PostingKeyRecord`
- Pydantic + Polars schema duals (same pattern as existing PostingRecord etc.)

**New file:** `src/fta_agent/tools/config_extraction.py`
- `ingest_sap_config(file_path, table_type)` → CSV → Polars → DataEngine
- `summarize_config()` → deterministic queries → ExtractionEvidence items
- `map_config_to_requirements()` → reference table mapping (doc type → PA, tolerance → BR)
- **Zero LLM calls**

**SAP tables supported (MVP — GL only):**

| Table | Content | Key Fields |
|-------|---------|-----------|
| T001 | Company codes | BUKRS, BUTXT, WAERS, KTOPL, PERIV |
| T004 | Chart of accounts | KTOPL, KTPLV |
| SKA1 | GL master (COA level) | KTOPL, SAKNR, KTOKS, XBILK |
| SKB1 | GL master (company code level) | BUKRS, SAKNR, MITKZ, XOPVW |
| SKAT | GL account descriptions | SPRAS, KTOPL, SAKNR, TXT20, TXT50 |
| T003/T003T | Document types | BLART, NUMKR, LTEXT |
| TBSL | Posting keys | BSCHL, SHKZG |
| T077S | GL account groups | KTOPL, KTOKS, TXT30 |
| T030 | Auto account determination | KTOPL, KTOSL, SAKNR |
| T009/T009B | Fiscal year variants | PERIV, BUMON, BUTAG |
| FINSC_LEDGER | Ledger definitions | RLDNR, XLEADING |

### Behavioral Extraction (Functional Consultant tools)

**New file:** `src/fta_agent/tools/behavioral_extraction.py`
- `ingest_transaction_log(file_path)` → BKPF-style CSV → DuckDB
- `analyze_posting_patterns()` → frequency, reversal rate, tcode distribution
- `map_tcodes_to_processes()` → reference table (tcode → PA/SP, shipped with tool)
- `analyze_close_timeline(file_path)` → close checklist → task model with critical path
- **Zero LLM calls** — Polars/DuckDB analytics

**Transaction code → Process mapping (shipped reference table):**

```yaml
# SP-02.1 Journal Entry Processing
FB50: GL journal entry
FB01: Post document
F-02: GL posting
FV50: Park GL document

# SP-02.5 GL Reconciliation
FBL3N: GL line item display
FS10N: GL balance display

# SP-09.1/09.2 AP Processing
FB60: Enter vendor invoice
F110: Automatic payment run

# SP-15.1 Period Close
OB52: Open/close posting periods
FAGLF101: Foreign currency valuation
```

### Coverage Analysis

**New file:** `src/fta_agent/extraction/coverage.py`
- Query evidence per PA/SP
- Compute coverage metrics
- Feed frontend coverage lens

### API Endpoint

`POST /api/v1/engagements/{id}/extractions` — multipart file upload → extraction → evidence items returned.

---

## E6: Document Ingestion (LLM-Powered, Future)

**New file:** `src/fta_agent/tools/document_extraction.py`
- `ingest_document(file_path)` → PDF/DOCX/XLSX parsing (pdfplumber, python-docx, openpyxl)
- Claude call with FTA reference library as context → structured process extraction
- Confidence scoring, PA/SP mapping via semantic matching
- Validation question generation from coverage gaps

**LangGraph node:** `src/fta_agent/agents/nodes/document_extraction.py`
- Conversational extraction: agent reads doc, surfaces findings, asks consultant to confirm
- `interrupt_before` for human confirmation
- Stores confirmed extractions in DuckDB

---

## How Reconciliation Works (The Key Insight)

### Three levels, no separate data model:

**Level 1 — Coverage (automatic):** For each PA/SP, count evidence items by source type. This is a query, not a data structure. Shown as the coverage lens on Process Inventory.

**Level 2 — Requirement enrichment (automatic):** For each BR with evidence, the evidence `summary` and `confidence` appear alongside the existing fit/gap assessment. Evidence can upgrade or qualify the assessment (e.g., "gap" → "partial fit, system supports but underutilized"). This is just an optional field on the existing `BusinessRequirement` type.

**Level 3 — Process flow enrichment (manual→agent):** Flow nodes gain `source: "extraction"` overlays showing how-done-today from behavioral data. Each overlay links back to its `ExtractionEvidence`. In workshop, the consultant validates these overlays.

### The coverage map isn't a deliverable — it's a computed view:
```
SELECT pa_id, source_type, COUNT(*), MIN(confidence)
FROM extraction_evidence
GROUP BY pa_id, source_type
```

### False confidence mitigation:
Every PA coverage indicator shows both **count** and **confidence**. A PA with 3 low-confidence evidence items renders differently from 1 high-confidence item. The confidence reflects extraction quality, not domain completeness.

---

## How Workshop Mode Changes

| Scenario | Before Extraction | After Extraction |
|----------|------------------|-----------------|
| Enter workshop for PA-02 | Empty canvas against leading practice | Pre-populated with evidence. Banner: "Validation Mode" |
| See a requirement | Generic text, manual fit/gap | Evidence badge: "12.7% reversal rate suggests automation target" |
| Keyboard shortcuts | R/N/G/A (create) | R/N/G/A (create) + C/D (confirm/dispute evidence) |
| Agent suggestions | Generic leading practice | Evidence-backed: "Log data shows 23 manual JEs/month — confirm?" |
| End workshop export | New reqs, modified reqs, gaps | + validation record (confirmed/disputed/pending per evidence item) |

---

## Critical Files Summary

| File | Changes |
|------|---------|
| `web/src/lib/mock-data.ts` | Type extensions: FitGapAnalysis, ProcessOverlay, ProcessInventoryNode, BusinessRequirement |
| `web/src/lib/mock-extractions.ts` | **NEW** — mock evidence, BR→evidence map, PA coverage, config/behavioral data |
| `web/src/components/workspace/EvidenceDetailPanel.tsx` | **NEW** — evidence detail slide-out panel |
| `web/src/components/workspace/BusinessRequirementsTable.tsx` | Evidence badges, validation mode banner |
| `web/src/components/workspace/ProcessInventoryGraph.tsx` | Coverage lens toggle |
| `web/src/components/workspace/ProcessFlowMap.tsx` | Extraction-sourced overlay rendering |
| `web/src/lib/workshop-store.ts` | validatedEvidence, disputeNotes Maps + actions |
| `web/src/lib/workshop-persistence.ts` | Serialize validation state |
| `web/src/hooks/useWorkshopKeyboard.ts` | C/D keyboard shortcuts |
| `web/src/components/workspace/WorkshopHistory.tsx` | Validation summary |
| `src/fta_agent/data/config_schemas.py` | **NEW** — SAP config Pydantic models |
| `src/fta_agent/tools/config_extraction.py` | **NEW** — config CSV→DuckDB |
| `src/fta_agent/tools/behavioral_extraction.py` | **NEW** — log analysis |
| `src/fta_agent/extraction/coverage.py` | **NEW** — coverage computation |
| `src/fta_agent/tools/document_extraction.py` | **NEW** — LLM-powered doc ingestion (E6) |

---

## Verification Checklist

1. `pnpm --filter web build` — clean TypeScript after type extensions
2. Business Requirements workspace → evidence badges on ~15 BRs
3. Click evidence badge → EvidenceDetailPanel with correct items
4. Process Inventory → toggle coverage lens → per-PA bars
5. Workshop Mode for PA-02 → "Validation Mode" banner
6. C key → emerald confirmation badge
7. D key → dispute notes input
8. End workshop → history shows validation summary
9. Export JSON → validation records included
10. No regressions on existing workspaces
