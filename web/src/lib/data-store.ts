"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ── Mock preview data ───────────────────────────────────────────────────────

export interface PostingRecord {
  posting_id: string;
  doc_number: string;
  posting_date: string;
  account: string;
  account_name: string;
  amount: number;
  currency: string;
  profit_center: string;
  lob: string;
  posted_by: string;
  doc_type: string;
}

export interface AccountMasterRecord {
  account_number: string;
  account_name: string;
  account_group: string;
  account_type: "Asset" | "Liability" | "Revenue" | "Expense" | "Equity";
  naic_group: string;
  posting_count: number;
  last_posting_date: string;
  doc_split_eligible: boolean;
}

export const SAMPLE_POSTINGS: PostingRecord[] = [
  { posting_id: "P-001", doc_number: "JE-2025-00142", posting_date: "2025-01-15", account: "1000", account_name: "Cash & Equivalents", amount: 1250000.00, currency: "USD", profit_center: "PC-AUTO", lob: "Personal Auto", posted_by: "SYSTEM", doc_type: "SA" },
  { posting_id: "P-002", doc_number: "JE-2025-00143", posting_date: "2025-01-15", account: "1100", account_name: "AR — Premium", amount: 842500.00, currency: "USD", profit_center: "PC-PROP", lob: "Commercial Property", posted_by: "MJOHNSON", doc_type: "DZ" },
  { posting_id: "P-003", doc_number: "JE-2025-00187", posting_date: "2025-01-20", account: "2000", account_name: "Loss & LAE Reserve", amount: -3450000.00, currency: "USD", profit_center: "PC-AUTO", lob: "Personal Auto", posted_by: "JSMITH", doc_type: "SA" },
  { posting_id: "P-004", doc_number: "JE-2025-00188", posting_date: "2025-01-20", account: "4000", account_name: "Net Premiums Earned", amount: 2180000.00, currency: "USD", profit_center: "PC-WC", lob: "Workers Comp", posted_by: "SYSTEM", doc_type: "SA" },
  { posting_id: "P-005", doc_number: "JE-2025-00201", posting_date: "2025-01-22", account: "6000", account_name: "Losses Incurred", amount: 1875000.00, currency: "USD", profit_center: "PC-AUTO", lob: "Personal Auto", posted_by: "JSMITH", doc_type: "SA" },
  { posting_id: "P-006", doc_number: "JE-2025-00215", posting_date: "2025-01-25", account: "4100", account_name: "Ceded Premiums", amount: -654000.00, currency: "USD", profit_center: "PC-PROP", lob: "Commercial Property", posted_by: "SYSTEM", doc_type: "SA" },
  { posting_id: "P-007", doc_number: "MJE-2025-00042", posting_date: "2025-01-31", account: "2100", account_name: "Unearned Premium Reserve", amount: -1125000.00, currency: "USD", profit_center: "PC-GL", lob: "General Liability", posted_by: "JSMITH", doc_type: "SA" },
  { posting_id: "P-008", doc_number: "JE-2025-00298", posting_date: "2025-02-03", account: "1200", account_name: "Reinsurance Recoverables", amount: 980000.00, currency: "USD", profit_center: "PC-CAT", lob: "Catastrophe", posted_by: "KLEE", doc_type: "SA" },
  { posting_id: "P-009", doc_number: "JE-2025-00312", posting_date: "2025-02-05", account: "2200", account_name: "Ceded Reinsurance Payable", amount: -445000.00, currency: "USD", profit_center: "PC-PROP", lob: "Commercial Property", posted_by: "SYSTEM", doc_type: "KZ" },
  { posting_id: "P-010", doc_number: "JE-2025-00340", posting_date: "2025-02-10", account: "7000", account_name: "Operating Expenses", amount: 312000.00, currency: "USD", profit_center: "PC-CORP", lob: "Corporate", posted_by: "ABROWN", doc_type: "KR" },
  { posting_id: "P-011", doc_number: "MJE-2025-00056", posting_date: "2025-02-15", account: "2000", account_name: "Loss & LAE Reserve", amount: -5200000.00, currency: "USD", profit_center: "PC-AUTO", lob: "Personal Auto", posted_by: "JSMITH", doc_type: "SA" },
  { posting_id: "P-012", doc_number: "JE-2025-00401", posting_date: "2025-02-18", account: "4000", account_name: "Net Premiums Earned", amount: 1890000.00, currency: "USD", profit_center: "PC-AUTO", lob: "Personal Auto", posted_by: "SYSTEM", doc_type: "SA" },
  { posting_id: "P-013", doc_number: "JE-2025-00415", posting_date: "2025-02-20", account: "1100", account_name: "AR — Premium", amount: 678000.00, currency: "USD", profit_center: "PC-WC", lob: "Workers Comp", posted_by: "MJOHNSON", doc_type: "DZ" },
  { posting_id: "P-014", doc_number: "JE-2025-00432", posting_date: "2025-02-22", account: "6000", account_name: "Losses Incurred", amount: 2340000.00, currency: "USD", profit_center: "PC-GL", lob: "General Liability", posted_by: "JSMITH", doc_type: "SA" },
  { posting_id: "P-015", doc_number: "JE-2025-00450", posting_date: "2025-02-28", account: "7000", account_name: "Operating Expenses", amount: 289000.00, currency: "USD", profit_center: "PC-CORP", lob: "Corporate", posted_by: "ABROWN", doc_type: "KR" },
];

export const SAMPLE_ACCOUNTS: AccountMasterRecord[] = [
  { account_number: "1000", account_name: "Cash & Equivalents", account_group: "Current Assets", account_type: "Asset", naic_group: "Invested Assets", posting_count: 12450, last_posting_date: "2025-02-28", doc_split_eligible: false },
  { account_number: "1100", account_name: "Accounts Receivable — Premium", account_group: "Current Assets", account_type: "Asset", naic_group: "Agents Balances", posting_count: 8302, last_posting_date: "2025-02-28", doc_split_eligible: true },
  { account_number: "1200", account_name: "Reinsurance Recoverables", account_group: "Current Assets", account_type: "Asset", naic_group: "Reinsurance Recoverables", posting_count: 4115, last_posting_date: "2025-02-28", doc_split_eligible: false },
  { account_number: "2000", account_name: "Loss & LAE Reserve", account_group: "Insurance Liabilities", account_type: "Liability", naic_group: "Losses", posting_count: 22891, last_posting_date: "2025-02-28", doc_split_eligible: false },
  { account_number: "2100", account_name: "Unearned Premium Reserve", account_group: "Insurance Liabilities", account_type: "Liability", naic_group: "Unearned Premiums", posting_count: 6730, last_posting_date: "2025-02-28", doc_split_eligible: false },
  { account_number: "2200", account_name: "Ceded Reinsurance Payable", account_group: "Payables", account_type: "Liability", naic_group: "Reinsurance Payable", posting_count: 3210, last_posting_date: "2025-02-28", doc_split_eligible: true },
  { account_number: "4000", account_name: "Net Premiums Earned", account_group: "Revenue", account_type: "Revenue", naic_group: "Net Premiums Earned", posting_count: 31540, last_posting_date: "2025-02-28", doc_split_eligible: false },
  { account_number: "4100", account_name: "Ceded Premiums", account_group: "Revenue", account_type: "Revenue", naic_group: "Reinsurance Ceded", posting_count: 9882, last_posting_date: "2025-02-28", doc_split_eligible: false },
  { account_number: "5000", account_name: "Net Investment Income", account_group: "Revenue", account_type: "Revenue", naic_group: "Net Investment Income", posting_count: 2450, last_posting_date: "2025-02-28", doc_split_eligible: false },
  { account_number: "6000", account_name: "Losses Incurred", account_group: "Insurance Expense", account_type: "Expense", naic_group: "Losses Incurred", posting_count: 18774, last_posting_date: "2025-02-28", doc_split_eligible: false },
  { account_number: "6100", account_name: "Loss Adjustment Expense", account_group: "Insurance Expense", account_type: "Expense", naic_group: "LAE Incurred", posting_count: 5890, last_posting_date: "2025-02-28", doc_split_eligible: false },
  { account_number: "7000", account_name: "Operating Expenses", account_group: "Operating Expense", account_type: "Expense", naic_group: "Other Underwriting Expenses", posting_count: 5621, last_posting_date: "2025-02-28", doc_split_eligible: false },
  { account_number: "7100", account_name: "Commissions & Brokerage", account_group: "Operating Expense", account_type: "Expense", naic_group: "Commission Expense", posting_count: 4230, last_posting_date: "2025-02-28", doc_split_eligible: false },
  { account_number: "8000", account_name: "Income Tax Expense", account_group: "Tax", account_type: "Expense", naic_group: "Federal Income Tax", posting_count: 890, last_posting_date: "2025-02-28", doc_split_eligible: false },
  { account_number: "9000", account_name: "Surplus — Policyholders", account_group: "Equity", account_type: "Equity", naic_group: "Surplus", posting_count: 120, last_posting_date: "2025-02-28", doc_split_eligible: false },
];

// ── Data file types ─────────────────────────────────────────────────────────

export interface DataFile {
  id: string;
  name: string;
  size_bytes: number;
  row_count: number;
  column_count: number;
  uploaded_at: string; // ISO string
  type: "trial_balance" | "coa_extract" | "posting_history" | "other";
}

/** Which deliverables depend on which file types */
export const FILE_TYPE_DELIVERABLES: Record<DataFile["type"], string[]> = {
  trial_balance: ["d-005-01", "d-005-02", "d-005-03", "d-005-04"],
  coa_extract: ["d-005-02", "d-005-03"],
  posting_history: ["d-005-01", "d-005-06"],
  other: [],
};

export const FILE_TYPE_LABELS: Record<DataFile["type"], string> = {
  trial_balance: "Trial Balance",
  coa_extract: "COA Extract",
  posting_history: "Posting History",
  other: "Other",
};

// ── Sample dataset ──────────────────────────────────────────────────────────

export const SAMPLE_DATA_FILE: DataFile = {
  id: "sample-acme-tb",
  name: "Acme_TB_FY2025.xlsx",
  size_bytes: 4_200_000,
  row_count: 512_041,
  column_count: 29,
  uploaded_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  type: "trial_balance",
};

// ── Store ───────────────────────────────────────────────────────────────────

interface DataStoreState {
  /** Files indexed by engagement ID */
  files: Record<string, DataFile[]>;
  /** Add a file to an engagement */
  addFile: (engagementId: string, file: DataFile) => void;
  /** Remove a file from an engagement */
  removeFile: (engagementId: string, fileId: string) => void;
  /** Load sample data for an engagement */
  loadSampleData: (engagementId: string) => void;
  /** Check if an engagement has any data */
  hasData: (engagementId: string) => boolean;
  /** Get files for an engagement */
  getFiles: (engagementId: string) => DataFile[];
}

export const useDataStore = create<DataStoreState>()(
  persist(
    (set, get) => ({
      files: {},

      addFile: (engagementId, file) =>
        set((state) => ({
          files: {
            ...state.files,
            [engagementId]: [...(state.files[engagementId] ?? []), file],
          },
        })),

      removeFile: (engagementId, fileId) =>
        set((state) => ({
          files: {
            ...state.files,
            [engagementId]: (state.files[engagementId] ?? []).filter(
              (f) => f.id !== fileId
            ),
          },
        })),

      loadSampleData: (engagementId) => {
        const existing = get().files[engagementId] ?? [];
        if (existing.some((f) => f.id === SAMPLE_DATA_FILE.id)) return;
        set((state) => ({
          files: {
            ...state.files,
            [engagementId]: [...existing, { ...SAMPLE_DATA_FILE, uploaded_at: new Date().toISOString() }],
          },
        }));
      },

      hasData: (engagementId) =>
        (get().files[engagementId] ?? []).length > 0,

      getFiles: (engagementId) =>
        get().files[engagementId] ?? [],
    }),
    {
      name: "fta-data-store",
    }
  )
);
