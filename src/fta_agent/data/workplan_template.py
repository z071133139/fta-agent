from __future__ import annotations

import uuid
from datetime import UTC, datetime

from fta_agent.data.workplan import Deliverable, DeliverableStatus, Workplan, Workstream


def _d(deliverable_id: str, name: str, owner_agent: str) -> Deliverable:
    return Deliverable(
        deliverable_id=deliverable_id,
        name=name,
        status=DeliverableStatus.NOT_STARTED,
        owner_agent=owner_agent,
    )


def build_pc_plan_design_template(engagement_id: str) -> Workplan:
    """Return the standard P&C Plan & Design workplan template.

    All 7 workstreams, all deliverables initialised to NOT_STARTED.
    ERP Software Selection is always included; mark individual deliverables
    as N/A (blocked) if SAP is pre-selected and the selection process is skipped.
    """
    return Workplan(
        workplan_id=str(uuid.uuid4()),
        engagement_id=engagement_id,
        created_at=datetime.now(UTC),
        workstreams=[
            Workstream(
                workstream_id="ws-pm-governance",
                name="Project Management & Governance",
                deliverables=[
                    _d("d-pm-01", "Project Charter", "consulting_agent"),
                    _d("d-pm-02", "Steering Committee Deck (template)", "consulting_agent"),
                    _d("d-pm-03", "RACI Matrix", "consulting_agent"),
                    _d("d-pm-04", "Risk & Issue Log (setup)", "consulting_agent"),
                    _d("d-pm-05", "Communication Plan", "consulting_agent"),
                ],
            ),
            Workstream(
                workstream_id="ws-business-case",
                name="Business Case & Scope",
                deliverables=[
                    _d("d-bc-01", "Business Case Document", "functional_consultant"),
                    _d("d-bc-02", "Scope Definition (in/out-of-scope inventory)", "functional_consultant"),
                    _d("d-bc-03", "Stakeholder Map", "consulting_agent"),
                    _d("d-bc-04", "Benefits Realization Framework", "functional_consultant"),
                ],
            ),
            Workstream(
                workstream_id="ws-erp-selection",
                name="ERP Software Selection",
                deliverables=[
                    _d("d-erp-01", "ERP Selection Criteria & Scoring Model", "consulting_agent"),
                    _d("d-erp-02", "Vendor Demonstrations Script (P&C-specific scenarios)", "functional_consultant"),
                    _d("d-erp-03", "RFP / RFI Template", "consulting_agent"),
                    _d("d-erp-04", "Evaluation Summary & Recommendation", "consulting_agent"),
                    _d("d-erp-05", "Reference Site Visit Report", "consulting_agent"),
                ],
            ),
            Workstream(
                workstream_id="ws-process-design",
                name="Business Process Design",
                deliverables=[
                    _d(
                        "d-pd-01",
                        "Process Inventory (R2R, P2P, FP&A, Financial Close, Treasury, Fixed Assets, "
                        "Reinsurance Accounting, Claims Finance, Regulatory/Statutory Reporting, Tax)",
                        "functional_consultant",
                    ),
                    _d("d-pd-02", "Current State Process Maps (BPMN / swim-lane)", "functional_consultant"),
                    _d("d-pd-03", "Future State Process Maps", "functional_consultant"),
                    _d("d-pd-04", "Business Requirements by Process", "functional_consultant"),
                    _d("d-pd-05", "User Stories Backlog", "functional_consultant"),
                    _d("d-pd-06", "Process Gap Analysis", "functional_consultant"),
                ],
            ),
            Workstream(
                workstream_id="ws-coa-gl-design",
                name="COA & GL Design",
                deliverables=[
                    _d("d-gl-01", "Account Analysis Report (MJE detection, profiling)", "gl_design_coach"),
                    _d("d-gl-02", "Chart of Accounts Design (code block, dimensions)", "gl_design_coach"),
                    _d("d-gl-03", "Account Mapping: Legacy → New COA", "gl_design_coach"),
                    _d(
                        "d-gl-04",
                        "ACDOCA Dimension Design (profit center, segment, functional area)",
                        "gl_design_coach",
                    ),
                    _d("d-gl-05", "Document Splitting Configuration Spec", "gl_design_coach"),
                    _d(
                        "d-gl-06",
                        "P&C-Specific Account Groups (NAIC alignment, loss reserves, reinsurance)",
                        "gl_design_coach",
                    ),
                    _d("d-gl-07", "GL Open Items / Clearing Accounts Inventory", "gl_design_coach"),
                    _d("d-gl-08", "Multi-GAAP Ledger Design (IFRS 17, US GAAP, Stat)", "gl_design_coach"),
                ],
            ),
            Workstream(
                workstream_id="ws-reporting",
                name="Reporting & Analytics",
                deliverables=[
                    _d("d-rpt-01", "Reporting Inventory (by user group and frequency)", "functional_consultant"),
                    _d("d-rpt-02", "Management Reporting Blueprint (P&L, balance sheet)", "functional_consultant"),
                    _d(
                        "d-rpt-03",
                        "Regulatory/Statutory Reporting Map (NAIC Annual Statement)",
                        "functional_consultant",
                    ),
                    _d("d-rpt-04", "Analytics & Dashboard Requirements", "functional_consultant"),
                    _d("d-rpt-05", "SAP Datasphere / BW4HANA Architecture (if in scope)", "functional_consultant"),
                ],
            ),
            Workstream(
                workstream_id="ws-data-integration",
                name="Data & Integration",
                deliverables=[
                    _d("d-di-01", "Data Migration Strategy", "functional_consultant"),
                    _d("d-di-02", "Data Quality Assessment", "functional_consultant"),
                    _d("d-di-03", "Integration Architecture Overview", "functional_consultant"),
                    _d("d-di-04", "Interface Inventory (source systems → SAP)", "functional_consultant"),
                    _d("d-di-05", "Data Cleansing Rules", "functional_consultant"),
                ],
            ),
        ],
    )
