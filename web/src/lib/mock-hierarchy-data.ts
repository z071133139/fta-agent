// ── Mock Data for COA Visualization Tabs ─────────────────────────────────────
// Account String Diagram, Dimensional Matrix, Dynamic Hierarchy

// ── Account String Segments ──────────────────────────────────────────────────

export interface AccountStringSegment {
  id: string;
  name: string;
  length: number;
  cardinality: number;
  fillRate: number;
  mandatory: boolean;
  statAlignment: string;
  exampleValues: string[];
  accountTypeCounts?: Record<string, number>;
}

export const ACCOUNT_STRING_SEGMENTS: AccountStringSegment[] = [
  {
    id: "seg-company",
    name: "Company",
    length: 4,
    cardinality: 3,
    fillRate: 100,
    mandatory: true,
    statAlignment: "Schedule Y, Part 2",
    exampleValues: ["1000", "2000", "3000"],
  },
  {
    id: "seg-dept",
    name: "Department",
    length: 4,
    cardinality: 12,
    fillRate: 95,
    mandatory: true,
    statAlignment: "Exhibit of Premiums & Losses",
    exampleValues: ["CC3000", "CC3100", "CC4000", "CC5000"],
  },
  {
    id: "seg-natural",
    name: "Natural Account",
    length: 6,
    cardinality: 68,
    fillRate: 100,
    mandatory: true,
    statAlignment: "Lines 1-21, Annual Statement",
    exampleValues: ["400100", "400200", "500100", "600100"],
    accountTypeCounts: { A: 18, L: 12, E: 4, R: 14, X: 20 },
  },
  {
    id: "seg-lob",
    name: "Line of Business",
    length: 4,
    cardinality: 8,
    fillRate: 88,
    mandatory: true,
    statAlignment: "Schedule P, Parts 1-3",
    exampleValues: ["AUTO", "HOME", "COMML", "WC"],
  },
  {
    id: "seg-rein",
    name: "Reinsurance",
    length: 2,
    cardinality: 4,
    fillRate: 65,
    mandatory: false,
    statAlignment: "Schedule F",
    exampleValues: ["QS", "XL", "FC", "NR"],
  },
  {
    id: "seg-prod",
    name: "Product",
    length: 4,
    cardinality: 15,
    fillRate: 72,
    mandatory: false,
    statAlignment: "State Page supplements",
    exampleValues: ["PPA", "HO3", "BOP", "WCM"],
  },
];

export const STAT_ALIGNMENT_PILLS = [
  { line: "19.1", label: "PPA No-Fault" },
  { line: "19.2", label: "PPA Liability" },
  { line: "4", label: "Homeowners" },
  { line: "5.1", label: "Comml Auto" },
  { line: "6", label: "Workers Comp" },
  { line: "17", label: "Other Liab" },
  { line: "3", label: "Farmowners" },
  { line: "21", label: "Auto Physical" },
];

// ── Dimensional Matrix ───────────────────────────────────────────────────────

export type AccountType = "Assets" | "Liabilities" | "Equity" | "Revenue" | "Expense";
export type LOBValue = "AUTO" | "HOME" | "COMML" | "WC" | "(none)";
export type ReinsuranceLayer = "All" | "QS" | "XOL" | "Fac" | "Net";

export interface MatrixCell {
  accountType: AccountType;
  lob: LOBValue;
  active: boolean;
  accountCount: number;
  postingCount: number;
  dollarVolume: string;
  topAccounts: string[];
  reinsuranceBreakdown?: Record<string, number>;
}

const ACCOUNT_TYPES: AccountType[] = ["Assets", "Liabilities", "Equity", "Revenue", "Expense"];
const LOB_VALUES: LOBValue[] = ["AUTO", "HOME", "COMML", "WC", "(none)"];

function makeCell(
  at: AccountType,
  lob: LOBValue,
  active: boolean,
  count: number,
  postings: number,
  volume: string,
  accounts: string[],
  rein?: Record<string, number>
): MatrixCell {
  return {
    accountType: at,
    lob,
    active,
    accountCount: count,
    postingCount: postings,
    dollarVolume: volume,
    topAccounts: accounts,
    reinsuranceBreakdown: rein,
  };
}

export const MATRIX_CELLS: MatrixCell[] = [
  // Assets
  makeCell("Assets", "AUTO", true, 12, 2847, "$145.2M", ["110100 Cash", "120100 Investments"], { QS: 65, XOL: 30, Fac: 5 }),
  makeCell("Assets", "HOME", true, 8, 1923, "$98.1M", ["110100 Cash", "125200 Receivables"], { QS: 45, XOL: 40, Fac: 15 }),
  makeCell("Assets", "COMML", true, 10, 2104, "$112.5M", ["110100 Cash", "130100 Premiums Recv"], { QS: 50, XOL: 35, Fac: 15 }),
  makeCell("Assets", "WC", true, 6, 1456, "$72.8M", ["110100 Cash", "120200 Bonds"], { QS: 40, XOL: 50, Fac: 10 }),
  makeCell("Assets", "(none)", true, 14, 3215, "$189.4M", ["110100 Cash", "120100 Investments"]),

  // Liabilities
  makeCell("Liabilities", "AUTO", true, 10, 3412, "$178.9M", ["210100 Loss Reserves", "220100 UPR"], { QS: 60, XOL: 35, Fac: 5 }),
  makeCell("Liabilities", "HOME", true, 9, 2876, "$142.3M", ["210100 Loss Reserves", "220100 UPR"], { QS: 50, XOL: 40, Fac: 10 }),
  makeCell("Liabilities", "COMML", true, 9, 2654, "$138.7M", ["210200 LAE Reserves", "220100 UPR"], { QS: 55, XOL: 30, Fac: 15 }),
  makeCell("Liabilities", "WC", true, 8, 2198, "$115.4M", ["210100 Loss Reserves", "210300 IBNR"], { QS: 35, XOL: 55, Fac: 10 }),
  makeCell("Liabilities", "(none)", true, 7, 1876, "$95.2M", ["230100 Other Liabilities"]),

  // Equity — no LOB-specific accounts (expected)
  makeCell("Equity", "AUTO", false, 0, 0, "$0", []),
  makeCell("Equity", "HOME", false, 0, 0, "$0", []),
  makeCell("Equity", "COMML", false, 0, 0, "$0", []),
  makeCell("Equity", "WC", false, 0, 0, "$0", []),
  makeCell("Equity", "(none)", true, 4, 48, "$52.1M", ["310100 Surplus", "320100 Retained Earnings"]),

  // Revenue
  makeCell("Revenue", "AUTO", true, 8, 4521, "$312.4M", ["400100 WP Direct", "400200 WP Assumed"], { QS: 65, XOL: 30, Fac: 5 }),
  makeCell("Revenue", "HOME", true, 6, 3187, "$198.7M", ["400100 WP Direct", "410100 EP"], { QS: 50, XOL: 35, Fac: 15 }),
  makeCell("Revenue", "COMML", true, 7, 2954, "$178.3M", ["400100 WP Direct", "400300 Ceded"], { QS: 55, XOL: 30, Fac: 15 }),
  makeCell("Revenue", "WC", true, 5, 2143, "$134.6M", ["400100 WP Direct"], { QS: 40, XOL: 50, Fac: 10 }),
  makeCell("Revenue", "(none)", false, 0, 0, "$0", []),

  // Expense
  makeCell("Expense", "AUTO", true, 9, 5678, "$287.1M", ["500100 Losses Incurred", "510100 LAE"], { QS: 65, XOL: 30, Fac: 5 }),
  makeCell("Expense", "HOME", true, 7, 4123, "$201.4M", ["500100 Losses Incurred", "520100 Comm"], { QS: 50, XOL: 35, Fac: 15 }),
  makeCell("Expense", "COMML", true, 7, 3876, "$195.8M", ["500100 Losses Incurred", "530100 UW Exp"], { QS: 55, XOL: 30, Fac: 15 }),
  makeCell("Expense", "WC", true, 5, 2987, "$156.2M", ["500100 Losses Incurred"], { QS: 35, XOL: 55, Fac: 10 }),
  makeCell("Expense", "(none)", true, 6, 1543, "$45.8M", ["540100 Gen Admin", "550100 IT Expense"]),
];

export function getMatrixData() {
  const totalPossible = ACCOUNT_TYPES.length * LOB_VALUES.length;
  const activeCount = MATRIX_CELLS.filter((c) => c.active).length;
  return {
    accountTypes: ACCOUNT_TYPES,
    lobValues: LOB_VALUES,
    cells: MATRIX_CELLS,
    totalPossible,
    activeCount,
    coveragePct: Math.round((activeCount / totalPossible) * 100),
    unusedCount: totalPossible - activeCount,
  };
}

export function getCell(at: AccountType, lob: LOBValue): MatrixCell | undefined {
  return MATRIX_CELLS.find((c) => c.accountType === at && c.lob === lob);
}

// ── Dynamic Hierarchy — FSLI Structures ──────────────────────────────────────

export type Perspective = "STAT" | "GAAP" | "IFRS17";
export type ClassificationTier = "tier1" | "tier2" | "tier3";
export type ClassificationStatus =
  | "classified"
  | "agent_proposed"
  | "approved"
  | "rejected"
  | "manual_override";

export interface FSLINode {
  id: string;
  label: string;
  parentId: string | null;
  accountCount: number;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  detail: string;
}

export interface HierarchyClassification {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  tier: ClassificationTier;
  status: ClassificationStatus;
  fsliNodeId: string;
  basis: string;
  agent: string;
  confidence: "high" | "medium" | "low";
  hash: string;
  auditTrail: AuditEntry[];
  perspectives: Record<Perspective, string>; // fsliNodeId per perspective
}

// ── STAT FSLI Structure ──────────────────────────────────────────────────────

export const STAT_FSLI: FSLINode[] = [
  { id: "stat-npw", label: "Net Premiums Written", parentId: null, accountCount: 14 },
  { id: "stat-npw-dir", label: "Direct Written", parentId: "stat-npw", accountCount: 8 },
  { id: "stat-npw-asm", label: "Assumed", parentId: "stat-npw", accountCount: 2 },
  { id: "stat-npw-ced", label: "Ceded", parentId: "stat-npw", accountCount: 4 },
  { id: "stat-losses", label: "Net Losses Incurred", parentId: null, accountCount: 12 },
  { id: "stat-losses-dir", label: "Direct Losses", parentId: "stat-losses", accountCount: 8 },
  { id: "stat-losses-ced", label: "Ceded Losses", parentId: "stat-losses", accountCount: 4 },
  { id: "stat-lae", label: "LAE", parentId: null, accountCount: 8 },
  { id: "stat-lae-def", label: "Defense & CC", parentId: "stat-lae", accountCount: 4 },
  { id: "stat-lae-adj", label: "Adjusting & Other", parentId: "stat-lae", accountCount: 4 },
  { id: "stat-uwexp", label: "Underwriting Expenses", parentId: null, accountCount: 10 },
  { id: "stat-invinc", label: "Investment Income", parentId: null, accountCount: 6 },
  { id: "stat-other", label: "Other Income", parentId: null, accountCount: 4 },
  { id: "stat-netinc", label: "Net Income", parentId: null, accountCount: 0 },
];

export const GAAP_FSLI: FSLINode[] = [
  { id: "gaap-rev", label: "Net Revenue", parentId: null, accountCount: 16 },
  { id: "gaap-rev-prem", label: "Net Premiums Earned", parentId: "gaap-rev", accountCount: 12 },
  { id: "gaap-rev-inv", label: "Investment Income", parentId: "gaap-rev", accountCount: 4 },
  { id: "gaap-lae", label: "Losses & LAE", parentId: null, accountCount: 18 },
  { id: "gaap-opex", label: "Operating Expenses", parentId: null, accountCount: 12 },
  { id: "gaap-opex-acq", label: "Acquisition Costs", parentId: "gaap-opex", accountCount: 6 },
  { id: "gaap-opex-gen", label: "General & Admin", parentId: "gaap-opex", accountCount: 6 },
  { id: "gaap-oci", label: "OCI", parentId: null, accountCount: 4 },
];

export const IFRS17_FSLI: FSLINode[] = [
  { id: "ifrs-isr", label: "Insurance Service Result", parentId: null, accountCount: 20 },
  { id: "ifrs-isr-rev", label: "Insurance Revenue", parentId: "ifrs-isr", accountCount: 10 },
  { id: "ifrs-isr-exp", label: "Insurance Service Expense", parentId: "ifrs-isr", accountCount: 10 },
  { id: "ifrs-inv", label: "Investment Result", parentId: null, accountCount: 8 },
  { id: "ifrs-fin", label: "Insurance Finance Income/Expense", parentId: null, accountCount: 6 },
  { id: "ifrs-csm", label: "CSM Movement", parentId: null, accountCount: 4 },
];

export const FSLI_BY_PERSPECTIVE: Record<Perspective, FSLINode[]> = {
  STAT: STAT_FSLI,
  GAAP: GAAP_FSLI,
  IFRS17: IFRS17_FSLI,
};

// ── Mock Classifications (~68 accounts) ──────────────────────────────────────

function makeHash(): string {
  return Math.random().toString(36).substring(2, 14);
}

function makeAudit(action: string, actor: string, detail: string): AuditEntry {
  return {
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
    action,
    actor,
    detail,
  };
}

// Tier 1 — Rule-based (55 accounts)
const TIER1_ACCOUNTS: HierarchyClassification[] = [
  // Written Premium accounts → NPW
  ...["400100", "400110", "400120", "400130", "400140", "400150", "400160", "400170"].map((code, i) => ({
    accountId: `acct-${code}`,
    accountCode: code,
    accountName: `WP ${["Direct-Auto", "Direct-Home", "Direct-Comml", "Direct-WC", "Direct-GL", "Direct-Prof", "Direct-Surety", "Direct-Other"][i]}`,
    accountType: "R",
    tier: "tier1" as ClassificationTier,
    status: "classified" as ClassificationStatus,
    fsliNodeId: "stat-npw-dir",
    basis: `Account range 400100-400199 maps to Direct Written Premium per Statutory Line ${i + 1}`,
    agent: "Rule Engine",
    confidence: "high" as const,
    hash: makeHash(),
    auditTrail: [makeAudit("classified", "Rule Engine", "Range-based classification rule")],
    perspectives: { STAT: "stat-npw-dir", GAAP: "gaap-rev-prem", IFRS17: "ifrs-isr-rev" },
  })),
  // Assumed premium
  ...["400200", "400210"].map((code, i) => ({
    accountId: `acct-${code}`,
    accountCode: code,
    accountName: `WP Assumed ${["Treaty", "Facultative"][i]}`,
    accountType: "R",
    tier: "tier1" as ClassificationTier,
    status: "classified" as ClassificationStatus,
    fsliNodeId: "stat-npw-asm",
    basis: "Account range 400200-400299 maps to Assumed Premium",
    agent: "Rule Engine",
    confidence: "high" as const,
    hash: makeHash(),
    auditTrail: [makeAudit("classified", "Rule Engine", "Range-based classification rule")],
    perspectives: { STAT: "stat-npw-asm", GAAP: "gaap-rev-prem", IFRS17: "ifrs-isr-rev" },
  })),
  // Ceded premium
  ...["400300", "400310", "400320", "400330"].map((code, i) => ({
    accountId: `acct-${code}`,
    accountCode: code,
    accountName: `WP Ceded ${["QS", "XOL", "Fac", "Other"][i]}`,
    accountType: "R",
    tier: "tier1" as ClassificationTier,
    status: "classified" as ClassificationStatus,
    fsliNodeId: "stat-npw-ced",
    basis: "Account range 400300-400399 maps to Ceded Premium",
    agent: "Rule Engine",
    confidence: "high" as const,
    hash: makeHash(),
    auditTrail: [makeAudit("classified", "Rule Engine", "Range-based classification rule")],
    perspectives: { STAT: "stat-npw-ced", GAAP: "gaap-rev-prem", IFRS17: "ifrs-isr-rev" },
  })),
  // Losses
  ...["500100", "500110", "500120", "500130", "500140", "500150", "500160", "500170"].map((code, i) => ({
    accountId: `acct-${code}`,
    accountCode: code,
    accountName: `Loss ${["Paid-Auto", "Paid-Home", "Paid-Comml", "Paid-WC", "Resv-Auto", "Resv-Home", "Resv-Comml", "Resv-WC"][i]}`,
    accountType: "X",
    tier: "tier1" as ClassificationTier,
    status: "classified" as ClassificationStatus,
    fsliNodeId: "stat-losses-dir",
    basis: "Account range 500100-500199 maps to Direct Losses Incurred",
    agent: "Rule Engine",
    confidence: "high" as const,
    hash: makeHash(),
    auditTrail: [makeAudit("classified", "Rule Engine", "Range-based classification rule")],
    perspectives: { STAT: "stat-losses-dir", GAAP: "gaap-lae", IFRS17: "ifrs-isr-exp" },
  })),
  // Ceded losses
  ...["500200", "500210", "500220", "500230"].map((code, i) => ({
    accountId: `acct-${code}`,
    accountCode: code,
    accountName: `Loss Ceded ${["QS", "XOL", "Fac", "IBNR"][i]}`,
    accountType: "X",
    tier: "tier1" as ClassificationTier,
    status: "classified" as ClassificationStatus,
    fsliNodeId: "stat-losses-ced",
    basis: "Account range 500200-500299 maps to Ceded Losses",
    agent: "Rule Engine",
    confidence: "high" as const,
    hash: makeHash(),
    auditTrail: [makeAudit("classified", "Rule Engine", "Range-based classification rule")],
    perspectives: { STAT: "stat-losses-ced", GAAP: "gaap-lae", IFRS17: "ifrs-isr-exp" },
  })),
  // LAE
  ...["510100", "510110", "510120", "510130"].map((code, i) => ({
    accountId: `acct-${code}`,
    accountCode: code,
    accountName: `DCC ${["Legal", "Expert", "Court", "Other"][i]}`,
    accountType: "X",
    tier: "tier1" as ClassificationTier,
    status: "classified" as ClassificationStatus,
    fsliNodeId: "stat-lae-def",
    basis: "Account range 510100-510199 maps to Defense & Cost Containment",
    agent: "Rule Engine",
    confidence: "high" as const,
    hash: makeHash(),
    auditTrail: [makeAudit("classified", "Rule Engine", "Range-based classification rule")],
    perspectives: { STAT: "stat-lae-def", GAAP: "gaap-lae", IFRS17: "ifrs-isr-exp" },
  })),
  // A&O LAE
  ...["510200", "510210", "510220", "510230"].map((code, i) => ({
    accountId: `acct-${code}`,
    accountCode: code,
    accountName: `AO ${["Adj Salary", "Adj Expense", "Claims IT", "Other"][i]}`,
    accountType: "X",
    tier: "tier1" as ClassificationTier,
    status: "classified" as ClassificationStatus,
    fsliNodeId: "stat-lae-adj",
    basis: "Account range 510200-510299 maps to Adjusting & Other LAE",
    agent: "Rule Engine",
    confidence: "high" as const,
    hash: makeHash(),
    auditTrail: [makeAudit("classified", "Rule Engine", "Range-based classification rule")],
    perspectives: { STAT: "stat-lae-adj", GAAP: "gaap-lae", IFRS17: "ifrs-isr-exp" },
  })),
  // UW Expenses
  ...["520100", "520110", "520120", "520130", "520140", "520150", "520160", "520170", "520180", "520190"].map((code, i) => ({
    accountId: `acct-${code}`,
    accountCode: code,
    accountName: `UW Exp ${["Commission", "Contingent Comm", "Policy Fee", "Premium Tax", "Board Fee", "Assessments", "Survey", "Audit", "Marketing", "Other"][i]}`,
    accountType: "X",
    tier: "tier1" as ClassificationTier,
    status: "classified" as ClassificationStatus,
    fsliNodeId: "stat-uwexp",
    basis: "Account range 520100-520999 maps to Underwriting Expenses",
    agent: "Rule Engine",
    confidence: "high" as const,
    hash: makeHash(),
    auditTrail: [makeAudit("classified", "Rule Engine", "Range-based classification rule")],
    perspectives: { STAT: "stat-uwexp", GAAP: "gaap-opex-acq", IFRS17: "ifrs-isr-exp" },
  })),
  // Investment Income
  ...["600100", "600110", "600120", "600130", "600140", "600150"].map((code, i) => ({
    accountId: `acct-${code}`,
    accountCode: code,
    accountName: `Inv ${["Bond Interest", "Equity Div", "RE Income", "Realized G/L", "Unrealized G/L", "Inv Expense"][i]}`,
    accountType: i < 5 ? "R" : "X",
    tier: "tier1" as ClassificationTier,
    status: "classified" as ClassificationStatus,
    fsliNodeId: "stat-invinc",
    basis: "Account range 600100-600999 maps to Investment Income",
    agent: "Rule Engine",
    confidence: "high" as const,
    hash: makeHash(),
    auditTrail: [makeAudit("classified", "Rule Engine", "Range-based classification rule")],
    perspectives: { STAT: "stat-invinc", GAAP: "gaap-rev-inv", IFRS17: "ifrs-inv" },
  })),
];

// Tier 2 — Pattern-based (9 accounts)
const TIER2_ACCOUNTS: HierarchyClassification[] = [
  ...["500750", "500760", "500770", "500780", "500790", "500800", "500810", "500820", "500830"].map((code, i) => ({
    accountId: `acct-${code}`,
    accountCode: code,
    accountName: `${["Alloc LAE-Salary", "Alloc LAE-Travel", "Alloc LAE-Systems", "Alloc LAE-Rent", "Alloc LAE-Training", "Salvage Recovery", "Subrogation", "Deductible Recv", "Co-Insurance"][i]}`,
    accountType: "X",
    tier: "tier2" as ClassificationTier,
    status: "classified" as ClassificationStatus,
    fsliNodeId: i < 5 ? "stat-lae-adj" : "stat-losses-dir",
    basis: `Pattern match: ${i < 5 ? "Account name contains 'Alloc LAE', type=X → Adjusting LAE" : "Account name contains recovery/subrogation pattern → offset to Direct Losses"}`,
    agent: "Pattern Matcher",
    confidence: "medium" as const,
    hash: makeHash(),
    auditTrail: [
      makeAudit("classified", "Pattern Matcher", "Name + type pattern match"),
      makeAudit("verified", "GL Design Coach", "Pattern confirmed against statutory instructions"),
    ],
    perspectives: {
      STAT: i < 5 ? "stat-lae-adj" : "stat-losses-dir",
      GAAP: i < 5 ? "gaap-lae" : "gaap-lae",
      IFRS17: "ifrs-isr-exp",
    },
  })),
];

// Tier 3 — Agent-classified (4 accounts, awaiting approval)
const TIER3_ACCOUNTS: HierarchyClassification[] = [
  {
    accountId: "acct-700100",
    accountCode: "700100",
    accountName: "Miscellaneous Income",
    accountType: "R",
    tier: "tier3",
    status: "agent_proposed",
    fsliNodeId: "stat-other",
    basis: "Account name 'income', type=R, no premium pattern detected. Not investment-related based on absence of securities terminology.",
    agent: "GL Design Coach",
    confidence: "medium",
    hash: makeHash(),
    auditTrail: [
      makeAudit("proposed", "GL Design Coach", "LLM classification — no rule or pattern match"),
      makeAudit("rationale", "GL Design Coach", "Excluded from NPW (no premium keywords), excluded from Investment (no securities/bond keywords). Residual → Other Income."),
    ],
    perspectives: { STAT: "stat-other", GAAP: "gaap-rev", IFRS17: "ifrs-isr-rev" },
  },
  {
    accountId: "acct-700200",
    accountCode: "700200",
    accountName: "Finance Charges",
    accountType: "R",
    tier: "tier3",
    status: "agent_proposed",
    fsliNodeId: "stat-other",
    basis: "Finance charges on premium installments. Revenue type, not core insurance premium. Pattern does not match investment income.",
    agent: "GL Design Coach",
    confidence: "medium",
    hash: makeHash(),
    auditTrail: [
      makeAudit("proposed", "GL Design Coach", "LLM classification — ambiguous between Other Income and Investment Income"),
    ],
    perspectives: { STAT: "stat-other", GAAP: "gaap-rev", IFRS17: "ifrs-fin" },
  },
  {
    accountId: "acct-700300",
    accountCode: "700300",
    accountName: "Bad Debt Expense",
    accountType: "X",
    tier: "tier3",
    status: "agent_proposed",
    fsliNodeId: "stat-uwexp",
    basis: "Bad debt on premiums receivable. Expense type. Could map to UW Expenses or Other Income offset. Mapped to UW Expenses as premium-adjacent.",
    agent: "GL Design Coach",
    confidence: "low",
    hash: makeHash(),
    auditTrail: [
      makeAudit("proposed", "GL Design Coach", "LLM classification — low confidence, multiple valid mappings"),
    ],
    perspectives: { STAT: "stat-uwexp", GAAP: "gaap-opex-gen", IFRS17: "ifrs-isr-exp" },
  },
  {
    accountId: "acct-700400",
    accountCode: "700400",
    accountName: "Intercompany Allocation",
    accountType: "X",
    tier: "tier3",
    status: "agent_proposed",
    fsliNodeId: "stat-uwexp",
    basis: "Intercompany cost allocation. Expense type. Mapped to Underwriting Expenses as operational overhead, but could be G&A under GAAP.",
    agent: "GL Design Coach",
    confidence: "low",
    hash: makeHash(),
    auditTrail: [
      makeAudit("proposed", "GL Design Coach", "LLM classification — intercompany transactions require manual review"),
    ],
    perspectives: { STAT: "stat-uwexp", GAAP: "gaap-opex-gen", IFRS17: "ifrs-isr-exp" },
  },
];

export const ALL_CLASSIFICATIONS: HierarchyClassification[] = [
  ...TIER1_ACCOUNTS,
  ...TIER2_ACCOUNTS,
  ...TIER3_ACCOUNTS,
];

export function getClassificationsByPerspective(perspective: Perspective) {
  const fsli = FSLI_BY_PERSPECTIVE[perspective];
  const tier1 = TIER1_ACCOUNTS.length;
  const tier2 = TIER2_ACCOUNTS.length;
  const tier3 = TIER3_ACCOUNTS.length;
  const total = tier1 + tier2 + tier3;
  const pending = TIER3_ACCOUNTS.filter((c) => c.status === "agent_proposed").length;

  return {
    fsli,
    classifications: ALL_CLASSIFICATIONS,
    stats: { total, tier1, tier2, tier3, pending, classified: total - pending },
  };
}
