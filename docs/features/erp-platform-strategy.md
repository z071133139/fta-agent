# ERP Platform Strategy

> Status: Ideation

## Strategy: SAP-First, Architect for Many

FTA targets multiple ERP platforms but launches with SAP as the first-class implementation. The architecture ensures adding a new platform is an additive effort (new adapter), not a restructuring effort.

## MVP: SAP S/4HANA

### Coverage
- S/4HANA Finance (new GL, Universal Journal)
- Chart of Accounts configuration (SKA1/SKAT, OB13, OBD4)
- Account groups, field status variants
- Document splitting and segment reporting
- Posting keys, document types
- Automatic posting rules
- Substitutions and validations
- Segment/profit center hierarchies
- Multi-ledger / parallel accounting (multi-GAAP)

### SAP-Specific Knowledge Sources
- SAP IMG documentation and configuration guides
- SAP Best Practices / Model Company content
- OSS notes and KBAs
- S/4HANA release-specific changes

### SAP-Specific Data Skills
- GL extract ingestion (trial balance, account master, posting data)
- Legacy-to-target COA mapping and transformation
- Validation against SAP posting logic and account determination

## Future: Oracle Cloud ERP

- Oracle Fusion chart of accounts structure
- Multi-GAAP ledgers
- Oracle Accounting Hub
- Worktag-equivalent dimensional model
- To be scoped when SAP MVP is stable

## Future: Workday Financials

- Worktag model (fundamentally different from traditional COA -- dimensional by design)
- Workday Financials accounting structure
- Implications for consultants accustomed to SAP/Oracle mental models
- To be scoped when SAP MVP is stable

## Platform Adapter Architecture

```
Domain Specialist Agent (e.g., GL Design Coach)
    |
    v
Platform-Neutral Interface
    |-- getCOAStructure()
    |-- mapLegacyAccount()
    |-- validatePostingLogic()
    |-- generateConfigSpec()
    |-- transformGLData()
    |
    +-- SAP Adapter (implements all methods for SAP)
    +-- Oracle Adapter (future)
    +-- Workday Adapter (future)
```

**Key principle:** The domain specialist agent's core logic never references SAP, Oracle, or Workday directly. It calls platform-neutral methods. The adapter translates.

## Open Questions

- [ ] What SAP versions/releases do we support? (S/4HANA only, or also ECC?)
- [ ] How do we keep the SAP knowledge base current as SAP releases updates?
- [ ] What is the data format standard for GL extracts? (CSV, SAP native export, API?)
- [ ] How do we handle platform-specific nuances that don't map cleanly to a neutral interface?
