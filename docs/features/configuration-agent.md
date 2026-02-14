# Configuration Agent (Layer 3 -- Future)

> Status: Ideation -- deferred beyond MVP

## Overview

The Configuration Agent closes the loop from design to execution. It takes structured design artifacts produced by Layer 2 domain specialist agents and translates them into platform-specific configuration that can be executed in the target ERP system.

## Why This is Deferred

SAP configuration is the **highest-risk layer** of the architecture:

- SAP configuration knowledge is deep, contextual, and version-dependent
- "Mostly right" configuration is dangerous in a production system
- LLM training data includes some SAP knowledge but is unreliable for production configuration
- API coverage for SAP configuration is incomplete

The value of getting this wrong far exceeds the cost of doing it manually. Therefore, this layer requires careful development with extensive validation before it can be trusted.

## Phased Approach

### Phase 1: Configuration Spec Generator (Near-term target)
The agent produces detailed, structured SAP configuration specifications:
- IMG path and transaction code
- Field values and settings
- Step-by-step instructions
- Directly traceable to design decisions

A functional consultant reviews and executes. The agent does 80% of the work; a human does the last mile.

**Value:** Saves hours of manual spec writing, eliminates ambiguity in handoff from design to configuration.

### Phase 2: Curated Configuration Knowledge Base
Build and maintain a verified, version-specific SAP configuration knowledge layer:
- Tested against real SAP systems
- Version-tagged (which S/4HANA release)
- Validated by experienced functional consultants

The agent reasons over this curated knowledge, not over general LLM training data.

### Phase 3: Record and Learn
Capture real SAP configuration sessions from experienced consultants:
- The agent observes and learns patterns from verified human actions
- Over time, it builds confidence in specific configuration patterns
- Quality improves with usage

### Phase 4: Direct API-Driven Configuration
The agent pushes configuration through SAP APIs (BAPIs, IDocs, Fiori APIs) in sandbox environments:
- Automated validation against design intent
- Run test postings, verify balances, check derivations
- Only promote to production after verification
- Full audit trail

## SAP Configuration Scope (When Implemented)

- GL account master records
- Account groups and field status variants
- Chart of accounts assignment to company codes
- Posting keys and document types
- Segment / profit center hierarchies
- Automatic posting rules
- Substitutions and validations
- Fiori app configuration

## Research Notes

### GitHub Resources
- [oigbokwe73/SAP-Configuration-File](https://github.com/oigbokwe73/SAP-Configuration-File) -- Scripts and diagrams for SAP FICO configuration. Basic but demonstrates the pattern of codifying SAP config steps.

### Key Insight
The lack of structured, machine-readable SAP configuration knowledge in the open-source ecosystem reinforces the opportunity. A verified, agent-consumable SAP configuration knowledge base would be a significant competitive moat.

## Open Questions

- [ ] What is the minimum viable configuration spec format?
- [ ] How do we validate configuration specs against SAP system state?
- [ ] What SAP APIs are available for programmatic configuration?
- [ ] How do we handle configuration dependencies and sequencing?
- [ ] What is the liability model when agent-generated configuration causes issues?
