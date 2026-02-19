# Research Prompt: Insurance Finance Process Inventory

> Use with: Claude Opus 4.6, Claude Opus 4.5 Extended Thinking, or GPT o3 / o4
> Purpose: Generate a comprehensive, insurance-specific finance process inventory for use as the knowledge library in an AI-native finance transformation platform.
> Do not send this file header — paste from the horizontal rule below.

---

## PROMPT

**You are a senior insurance finance transformation principal** with 20+ years of experience leading ERP implementations for P&C carriers, life/annuity insurers, and reinsurers. You have personally led or overseen the finance process design phase on 15+ major transformations using SAP S/4HANA, Oracle Cloud ERP, and Workday Financials. You know how insurance finance actually works — not from textbooks, but from the specifics of how loss reserves get posted, how ceded reinsurance settlements flow, how premium accounting differs by line of business, and why the financial close at an insurer is structurally different from manufacturing or retail.

Your task is to produce a **comprehensive, insurance-specific finance process inventory** that a consulting team can use as the starting-point scope definition for a finance transformation ERP project. This is the canonical reference — it needs to be deep enough that a junior consultant could use it as a framework and sound credible to a CFO.

---

### CONTEXT: How This Will Be Used

This inventory will power the **Process Inventory workspace** in an AI-native finance transformation platform (FTA). When a consultant opens the Process Inventory for a new engagement, the platform presents this inventory — calibrated to the client's insurance segment (P&C, Life/Annuity, Reinsurance) — and the consultant confirms, adjusts, and scopes the processes for this specific engagement.

The inventory must therefore be:
1. **Structurally complete** — covers all standard finance processes an insurer would typically have in scope for a transformation
2. **Insurance-specific** — not generic finance/ERP processes; each process and sub-flow must reflect how insurance finance actually works
3. **Segment-differentiated** — P&C, Life/Annuity, and Reinsurance have materially different process footprints; these differences must be explicit
4. **ERP-aware** — note where a process is natively well-supported vs. typically requiring significant configuration in SAP S/4HANA, Oracle Cloud ERP, or Workday Financials
5. **Practically scoped** — distinguish between what is almost always in scope for a transformation vs. what is frequently deferred, out of scope, or addressed in a separate workstream

---

### OUTPUT FORMAT

Produce the inventory in the following structure. Be exhaustive — this is a reference document, not a summary.

---

#### SECTION 1: Process Area Index

List every finance process area, with a one-sentence description of what it covers in an insurance context. Sequence them in the order they would typically be addressed in a transformation (dependencies first).

Format:
```
[Process Area ID] | [Name] | [One-sentence insurance-specific description]
```

Example (do not use this as the actual content — generate the real list):
```
FA-01 | Record-to-Report (R2R) | End-to-end process from transaction capture through financial statement production, including all insurance-specific posting patterns (premium, loss, reinsurance).
```

---

#### SECTION 2: Detailed Process Inventory

For each process area from Section 1, provide the following:

**Process Area: [Name]**

**Insurance Relevance:** 2-3 sentences on why this process is distinctive for insurers vs. other industries. What makes insurance finance different here?

**Segment Applicability:**
- P&C: [Always in scope / Usually in scope / Sometimes in scope / Rarely in scope] — brief reason
- Life/Annuity: [Always / Usually / Sometimes / Rarely] — brief reason
- Reinsurance: [Always / Usually / Sometimes / Rarely] — brief reason

**Standard Sub-Processes:**
List every standard sub-process / sub-flow within this process area. For each:
- Sub-process name and description (insurance-specific, not generic)
- Segment variations: note if the sub-process significantly differs between P&C / Life / Reinsurance
- Typical in/out scope: is this almost always in scope, frequently deferred, or commonly excluded from the ERP transformation scope?
- Key complexity flag: [High / Medium / Low] — how complex is this typically to design and configure in an ERP?

**Cross-Process Dependencies:** What other process areas does this one depend on or significantly interact with?

**ERP Notes:**
- SAP S/4HANA: Where is this process natively strong? Where are the known gaps or heavy configuration areas?
- Oracle Cloud ERP: Same
- Workday Financials: Same (note if Workday is not typically used for this process area)

**Common Scoping Decisions:** What decisions does a consulting team typically have to make when scoping this process area? What are the most common debates?

---

#### SECTION 3: Segment-Specific Process Footprints

For each segment (P&C, Life/Annuity, Reinsurance), provide:

1. **Core process areas** — virtually always in scope for any transformation in this segment
2. **Common additions** — frequently added based on engagement scope
3. **Rarely in scope** — process areas that are almost never in the ERP transformation scope for this segment (and why — where do they live instead?)
4. **Segment-specific process areas** — process areas unique to or fundamentally different in this segment that don't appear in the generic list

---

#### SECTION 4: Insurance-Specific Process Areas Not in Generic Finance Libraries

Generic ERP finance process libraries (e.g., SAP Best Practice content, Oracle Process Accelerators) are built for manufacturing and retail. Document the process areas that are **insurance-specific** — they exist in insurance but are absent or fundamentally different in generic libraries. For each:
- Name and full description
- Why generic ERP content is insufficient
- Which insurance segments it applies to
- Where it typically sits in the ERP scope (finance module? sub-ledger? separate system?)

Key areas to cover (but not limited to):
- Premium accounting and earned premium calculation
- Loss reserving (case, IBNR, LAE, ULAE)
- Ceded reinsurance accounting
- Assumed reinsurance accounting (where applicable)
- Claims payment accounting
- Policyholder liability accounting (Life)
- Actuarial-to-accounting interface
- Regulatory / statutory reporting (NAIC, Solvency II, LDTI, IFRS 17)
- Loss run and schedule production
- Investment accounting interface

---

#### SECTION 5: Standard Scoping Questions per Process Area

For the 8-10 most complex or decision-heavy process areas, provide the **5-7 scoping questions** a consultant should ask a client CFO or Controller during the Process Inventory phase. These questions should:
- Surface client-specific complexity not visible from the outside
- Be the questions a junior consultant would miss but a senior principal always asks
- Drive the scope decision (in/out/defer) and the future-state design

Format:
```
Process Area: [Name]

Scoping Questions:
1. [Question] — [Why this matters: what the answer reveals]
2. ...
```

---

#### SECTION 6: Process Complexity and Transformation Risk Matrix

Produce a matrix covering all process areas:

| Process Area | Typical Complexity | Transformation Risk | Most Common Scope Trap | Insurance-Specific Risk |
|---|---|---|---|---|
| [name] | H/M/L | H/M/L | [what teams often underscope] | [insurance-specific gotcha] |

---

### DEPTH EXPECTATIONS

- This is a reference document for senior consultants, not an introductory guide. Do not over-explain basics.
- Use correct insurance accounting terminology: earned premium, ceded/assumed, IBNR, LAE, ULAE, UPR, retrospective rating, facultative/treaty, loss run, statutory surplus, NAIC, Schedule P, Schedule F, A-GAAP vs. STAT, etc.
- Where processes differ between US GAAP, IFRS 17, and STAT, note the variance — these create parallel process requirements on the same transformation.
- Use SAP terminology where relevant: ACDOCA, profit center, segment, company code, document type, posting key, FI-GL, FI-AR, FI-AP, FI-AA, FS-CD (Collections & Disbursements), FS-RI (Reinsurance), FPSL.
- Call out where FS-CD and FS-RI significantly change the process design for insurers using SAP (these are SAP's insurance-specific components and are often misunderstood in scope planning).
- If a process area is well-covered by a specific SAP Best Practice scope item or Oracle Process Accelerator, name it.

---

### QUALITY BAR

Before finalizing your output, review against this checklist:
- [ ] Every process area is insurance-specific in its description — a manufacturing CFO would not recognize their own process in it
- [ ] Segment differences are explicit and specific — not just "varies by segment" but HOW it varies
- [ ] ERP notes are specific — "SAP handles this natively via FS-CD" is useful; "SAP can support this" is not
- [ ] Scoping questions would make a junior consultant sound senior if they asked them in a discovery session
- [ ] The complexity/risk matrix would help a project manager size the workplan accurately
- [ ] Sub-processes are at the right level of granularity — not too high (would fit on a single slide) and not too low (individual transaction types)

---

### IMPORTANT

Do not compress or summarize to fit a response length limit. This is a deep research task. If the full output exceeds a typical response length, continue until the inventory is complete. Quality and completeness are more important than brevity. A senior consultant will use this document as a reference — it needs to be trusted.
