# Agent Deliverable Backlog

Deliverables not yet surfaced in the sidebar workplan. Organized by owning agent. These are future work items that will be promoted to active workstreams when the engagement reaches the appropriate phase.

---

## GL Design Coach

| ID | Deliverable | Dependencies | Notes |
|----|------------|-------------|-------|
| d-005-05 | Document Splitting Configuration Spec | COA Design (d-005-02), Dimension Design (d-005-04) | Defines how SAP splits accounting documents across profit center, segment, functional area at posting time. Critical for P&C multi-LOB split. |
| d-005-06 | P&C-Specific Account Groups (NAIC alignment, loss reserves, reinsurance) | COA Design (d-005-02) | Groups GL accounts to align with NAIC Annual Statement lines — Schedule P, Schedule F, Exhibit of Premiums & Losses. |
| d-005-07 | GL Open Items / Clearing Accounts Inventory | Client trial balance extract | Catalogs accounts with open item management (premium receivables, reinsurance recoverables, intercompany) and clearing accounts. **Blocked** on client data. |
| d-005-08 | Multi-GAAP Ledger Design (IFRS 17, US GAAP, Stat) | COA Design (d-005-02), Account Mapping (d-005-03) | Parallel ledger architecture: one posting produces STAT, GAAP, and IFRS 17 views. IFRS 17 CSM tracking is the hardest part. Cross-referenced by 8+ regulatory reports. |

---

## Functional Consultant

| ID | Deliverable | Dependencies | Notes |
|----|------------|-------------|-------|
| d-004-03 | Future State Process Maps | Process Inventory (d-004-01) | Swimlane designs across all process areas (R2R, P2P, FP&A, Close, Treasury, Fixed Assets, Reinsurance, Claims Finance, Statutory, Tax). |
| d-004-05 | User Stories Backlog | Business Requirements (d-004-04) | Agile-formatted user stories derived from validated business requirements. |
| d-004-06 | Process Gap Analysis | Process Inventory (d-004-01), Business Requirements (d-004-04) | Systematic gap identification: current state vs. future state vs. ERP standard. |
| d-006-02 | Management Reporting Blueprint (P&L, balance sheet) | Reporting Inventory (d-006-01), COA Design (d-005-02) | Internal management reporting structure — P&L by LOB, balance sheet by entity, combined ratio dashboards. |
| d-006-03 | Regulatory/Statutory Reporting Map (NAIC Annual Statement) | Reporting Inventory (d-006-01), COA Design (d-005-02) | Maps each NAIC Annual Statement schedule to COA dimensions and data sources. |
| d-006-04 | Analytics & Dashboard Requirements | Reporting Inventory (d-006-01) | BI layer requirements — executive dashboards, actuarial analytics, claims trending. |
| d-006-05 | SAP Datasphere / BW4HANA Architecture (if in scope) | Reporting Blueprint (d-006-02) | Data warehouse / analytics platform architecture decision and design. |
| d-007-01 | Data Migration Strategy | Process Inventory (d-004-01) | Approach for migrating balances, master data, and historical transactions. |
| d-007-02 | Data Quality Assessment | Client data extracts | Profile source system data quality — completeness, accuracy, consistency. |
| d-007-03 | Integration Architecture Overview | ERP Selection (d-003-04) | System integration patterns: claims → GL, policy admin → subledger, reinsurance → treaty. |
| d-007-04 | Interface Inventory (source systems → SAP) | Integration Architecture (d-007-03) | Catalog all inbound/outbound interfaces with frequency, volume, and protocol. |
| d-007-05 | Data Cleansing Rules | Data Quality Assessment (d-007-02) | Transformation and cleansing rules for migration — account mapping, entity consolidation, historical restatement. |

---

## Consulting Agent

| ID | Deliverable | Dependencies | Notes |
|----|------------|-------------|-------|
| d-001-05 | Communication Plan | Project Charter (d-001-01) | Stakeholder communication cadence, channels, and escalation paths. |
| d-002-04 | Benefits Realization Framework | Business Case (d-002-01) | KPIs and tracking mechanism for projected benefits ($4.2M investment, 18-month payback). |
| d-003-05 | Reference Site Visit Report | ERP Selection (d-003-04) | Document findings from reference customer visits (SAP S/4HANA insurance implementations). |
