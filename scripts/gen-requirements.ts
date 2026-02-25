// Generator script for mock-requirements.ts
// Run with: npx ts-node scripts/gen-requirements.ts > web/src/lib/mock-requirements.ts

const PA_DEFS = [
  { pa: "01", name: "Chart of Accounts & Org Structure", sps: 4, total: 16 },
  { pa: "02", name: "General Ledger & Multi-Basis Accounting", sps: 5, total: 20 },
  { pa: "03", name: "Premium Accounting & Revenue Recognition", sps: 5, total: 20 },
  { pa: "04", name: "Loss & Claims Accounting", sps: 5, total: 20 },
  { pa: "05", name: "Ceded Reinsurance Accounting", sps: 5, total: 25 },
  { pa: "06", name: "Assumed Reinsurance Accounting", sps: 4, total: 12 },
  { pa: "07", name: "Policyholder Liabilities & Reserves", sps: 5, total: 15 },
  { pa: "08", name: "Investment Accounting Interface", sps: 5, total: 15 },
  { pa: "09", name: "Accounts Payable & Commission Payments", sps: 4, total: 16 },
  { pa: "10", name: "Accounts Receivable & Premium Collections", sps: 4, total: 16 },
  { pa: "11", name: "Intercompany & Pooling", sps: 3, total: 12 },
  { pa: "12", name: "Fixed Assets & Leases", sps: 3, total: 9 },
  { pa: "13", name: "Cash Management & Treasury", sps: 4, total: 16 },
  { pa: "14", name: "Expense Management & Cost Allocation", sps: 4, total: 16 },
  { pa: "15", name: "Financial Close & Consolidation", sps: 6, total: 24 },
  { pa: "16", name: "Statutory & Regulatory Reporting", sps: 7, total: 21 },
  { pa: "17", name: "GAAP/IFRS External Reporting", sps: 4, total: 12 },
  { pa: "18", name: "Tax Accounting & Compliance", sps: 4, total: 12 },
  { pa: "19", name: "Management Reporting & Analytics", sps: 5, total: 15 },
  { pa: "20", name: "Data Integration & Sub-Ledger Interfaces", sps: 6, total: 12 },
];

console.log(PA_DEFS.reduce((s, p) => s + p.total, 0));
