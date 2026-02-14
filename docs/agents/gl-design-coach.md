# GL Design Coach (Layer 2 -- Domain Specialist Agent)

> Status: Ideation -- MVP domain specialist, to be scoped in detail

## Overview

The GL Design Coach is the first domain specialist agent in FTA. It encodes the expertise of a senior insurance finance consultant specializing in chart of accounts design and GL architecture. It is not a template filler -- it reasons, advises, guides, and pushes back.

## Capabilities

### Knowledge
- Insurance-specific GL structures (life, P&C, reinsurance, health)
- Statutory vs. GAAP/IFRS account hierarchies
- Segment/entity/LOB dimensionality
- Subledger-to-GL mapping patterns
- Intercompany design
- Regulatory reporting requirements and their GL implications
- IFRS 17 / LDTI impact on COA design

### ERP Platform Knowledge (SAP-first)
- S/4HANA new GL / Universal Journal (ACDOCA)
- Account groups, field status variants
- Document splitting and segment reporting
- Posting keys, document types
- Automatic posting rules
- Substitutions and validations
- Classic vs. new asset accounting implications

**Architecture note:** SAP-specific knowledge is delivered through a platform adapter. The coach's core domain logic is platform-neutral. Adding Oracle or Workday support means adding a new adapter, not modifying the coach.

### Tools (Specialist-Specific)
- **COA Builder** -- construct a target chart of accounts based on client context and requirements
- **Mapping Generator** -- create mappings from legacy COA to target COA
- **Gap Analyzer** -- compare current state to target and identify gaps
- **Regulatory Cross-Reference Checker** -- validate COA design against regulatory reporting needs
- **Data Transformer** -- convert data from old GL to target GL to verify the new chart of accounts

### Memory
- Remembers the client's current state, prior design decisions, and constraints
- Tracks which design areas have been addressed and which remain open
- Maintains decision history with rationale

### Process Guidance
The GL Design Coach doesn't just answer questions -- it drives a structured design journey:

1. Understand the current COA structure and pain points
2. Define design principles and constraints (regulatory, reporting, operational)
3. Design the natural account structure
4. Design the dimensional model (segments, profit centers, cost centers, LOBs)
5. Define the subledger-to-GL mapping strategy
6. Build the target COA
7. Map legacy accounts to target
8. Validate through data conversion testing
9. Produce design documentation and sign-off materials

The coach knows where you are in this journey and guides you to the next step.

### Opinions
The GL Design Coach has strong views based on best practices:
- It will challenge a flat COA with thousands of accounts when a dimensional approach is more appropriate
- It will flag when a design doesn't support required regulatory reporting
- It will identify when intercompany design is missing or insufficient
- It will warn about data migration complexity implications of design choices

## Data Skills

This is a critical differentiator. The GL Design Coach doesn't just help design on paper -- it works with real client data:

- **Ingest:** Accept legacy GL extracts (trial balances, account masters, posting data)
- **Transform:** Apply mapping rules to convert legacy data to the target COA structure
- **Validate:** Run the converted data against the target design to identify exceptions, unmapped accounts, balance discrepancies
- **Report:** Surface issues and insights from the conversion test

This allows consultants to demonstrate to clients: "We didn't just design this on paper -- we've already run your actuals through the target structure."

## Integration with Layer 1

The GL Design Coach can invoke Layer 1 general tools:
- Call the **Deck Builder** to produce a COA design presentation
- Call the **Requirements Engine** to capture requirements surfaced during COA design
- Call the **Process Documenter** to document GL-related process changes

## Open Questions

- [ ] What is the scope of the MVP GL Design Coach vs. full version?
- [ ] How deep should the SAP-specific knowledge be at launch?
- [ ] What data formats should the data transformer accept initially?
- [ ] How does the coach interact with other future specialist agents (e.g., Close Process Architect needs COA decisions)?
- [ ] What is the training data / knowledge base strategy for encoding domain expertise?
