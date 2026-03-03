"use client";

import { useState } from "react";
import {
  SAMPLE_POSTINGS,
  SAMPLE_ACCOUNTS,
  type PostingRecord,
  type AccountMasterRecord,
} from "@/lib/data-store";

type Tab = "columns" | "postings" | "accounts";

function formatAmount(n: number): string {
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return n < 0 ? `(${formatted})` : formatted;
}

// ── Column schema for the trial balance file ─────────────────────────────────

interface ColumnDef {
  name: string;
  type: string;
  nullable: boolean;
  sample: string;
}

const TB_COLUMNS: ColumnDef[] = [
  { name: "POSTING_ID", type: "VARCHAR(20)", nullable: false, sample: "P-001" },
  { name: "DOC_NUMBER", type: "VARCHAR(20)", nullable: false, sample: "JE-2025-00142" },
  { name: "DOC_TYPE", type: "VARCHAR(4)", nullable: false, sample: "SA" },
  { name: "DOC_HEADER_TEXT", type: "VARCHAR(100)", nullable: true, sample: "Monthly accrual — Auto" },
  { name: "POSTING_DATE", type: "DATE", nullable: false, sample: "2025-01-15" },
  { name: "DOCUMENT_DATE", type: "DATE", nullable: true, sample: "2025-01-14" },
  { name: "PERIOD", type: "INT", nullable: false, sample: "1" },
  { name: "FISCAL_YEAR", type: "INT", nullable: false, sample: "2025" },
  { name: "COMPANY_CODE", type: "VARCHAR(4)", nullable: false, sample: "1000" },
  { name: "ACCOUNT", type: "VARCHAR(10)", nullable: false, sample: "1000" },
  { name: "ACCOUNT_NAME", type: "VARCHAR(80)", nullable: false, sample: "Cash & Equivalents" },
  { name: "ACCOUNT_GROUP", type: "VARCHAR(40)", nullable: true, sample: "Current Assets" },
  { name: "ACCOUNT_TYPE", type: "VARCHAR(10)", nullable: false, sample: "Asset" },
  { name: "AMOUNT_LC", type: "DECIMAL(15,2)", nullable: false, sample: "1,250,000.00" },
  { name: "CURRENCY", type: "VARCHAR(3)", nullable: false, sample: "USD" },
  { name: "AMOUNT_GC", type: "DECIMAL(15,2)", nullable: true, sample: "1,250,000.00" },
  { name: "DEBIT_CREDIT", type: "VARCHAR(1)", nullable: false, sample: "S" },
  { name: "PROFIT_CENTER", type: "VARCHAR(10)", nullable: true, sample: "PC-AUTO" },
  { name: "COST_CENTER", type: "VARCHAR(10)", nullable: true, sample: "CC-UW-01" },
  { name: "LINE_OF_BUSINESS", type: "VARCHAR(40)", nullable: true, sample: "Personal Auto" },
  { name: "SEGMENT", type: "VARCHAR(20)", nullable: true, sample: "P&C" },
  { name: "FUNCTIONAL_AREA", type: "VARCHAR(20)", nullable: true, sample: "Underwriting" },
  { name: "TRADING_PARTNER", type: "VARCHAR(10)", nullable: true, sample: "" },
  { name: "ASSIGNMENT", type: "VARCHAR(18)", nullable: true, sample: "POL-2025-A001" },
  { name: "REFERENCE", type: "VARCHAR(16)", nullable: true, sample: "CLM-2025-0042" },
  { name: "POSTED_BY", type: "VARCHAR(12)", nullable: false, sample: "SYSTEM" },
  { name: "ENTRY_DATE", type: "TIMESTAMP", nullable: false, sample: "2025-01-15T08:32:00" },
  { name: "IS_REVERSAL", type: "BOOLEAN", nullable: false, sample: "FALSE" },
  { name: "CLEARING_DOC", type: "VARCHAR(20)", nullable: true, sample: "" },
];

function ColumnsTable({ columns }: { columns: ColumnDef[] }) {
  return (
    <table className="w-full text-xs font-mono">
      <thead>
        <tr className="border-b border-border/30 text-[10px] uppercase tracking-wider text-muted">
          <th className="text-left py-2 px-2 font-medium w-8">#</th>
          <th className="text-left py-2 px-2 font-medium">Column</th>
          <th className="text-left py-2 px-2 font-medium">Type</th>
          <th className="text-center py-2 px-2 font-medium">Nullable</th>
          <th className="text-left py-2 px-2 font-medium">Sample Value</th>
        </tr>
      </thead>
      <tbody>
        {columns.map((col, i) => (
          <tr
            key={col.name}
            className="border-b border-border/10 hover:bg-surface-alt/30 transition-colors"
          >
            <td className="py-1.5 px-2 text-muted/50">{i + 1}</td>
            <td className="py-1.5 px-2 text-foreground/90">{col.name}</td>
            <td className="py-1.5 px-2 text-accent/80">{col.type}</td>
            <td className="py-1.5 px-2 text-center">
              {col.nullable ? (
                <span className="text-muted/50">yes</span>
              ) : (
                <span className="text-foreground/60">no</span>
              )}
            </td>
            <td className="py-1.5 px-2 text-muted">
              {col.sample || <span className="text-muted/30 italic">empty</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Existing tables ──────────────────────────────────────────────────────────

function PostingsTable({ rows }: { rows: PostingRecord[] }) {
  return (
    <table className="w-full text-xs font-mono">
      <thead>
        <tr className="border-b border-border/30 text-[10px] uppercase tracking-wider text-muted">
          <th className="text-left py-2 px-2 font-medium">Doc #</th>
          <th className="text-left py-2 px-2 font-medium">Date</th>
          <th className="text-left py-2 px-2 font-medium">Account</th>
          <th className="text-left py-2 px-2 font-medium">Name</th>
          <th className="text-right py-2 px-2 font-medium">Amount</th>
          <th className="text-left py-2 px-2 font-medium">PC</th>
          <th className="text-left py-2 px-2 font-medium">LOB</th>
          <th className="text-left py-2 px-2 font-medium">User</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr
            key={r.posting_id}
            className="border-b border-border/10 hover:bg-surface-alt/30 transition-colors"
          >
            <td className="py-1.5 px-2 text-muted">{r.doc_number}</td>
            <td className="py-1.5 px-2 text-muted">{r.posting_date}</td>
            <td className="py-1.5 px-2 text-foreground/90">{r.account}</td>
            <td className="py-1.5 px-2 text-foreground/80">{r.account_name}</td>
            <td
              className={`py-1.5 px-2 text-right ${
                r.amount < 0 ? "text-red-400" : "text-foreground/90"
              }`}
            >
              {formatAmount(r.amount)}
            </td>
            <td className="py-1.5 px-2 text-muted">{r.profit_center}</td>
            <td className="py-1.5 px-2 text-muted">{r.lob}</td>
            <td
              className={`py-1.5 px-2 ${
                r.posted_by === "JSMITH"
                  ? "text-warning"
                  : "text-muted"
              }`}
            >
              {r.posted_by}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AccountsTable({ rows }: { rows: AccountMasterRecord[] }) {
  return (
    <table className="w-full text-xs font-mono">
      <thead>
        <tr className="border-b border-border/30 text-[10px] uppercase tracking-wider text-muted">
          <th className="text-left py-2 px-2 font-medium">Account</th>
          <th className="text-left py-2 px-2 font-medium">Name</th>
          <th className="text-left py-2 px-2 font-medium">Type</th>
          <th className="text-left py-2 px-2 font-medium">NAIC Group</th>
          <th className="text-right py-2 px-2 font-medium">Postings</th>
          <th className="text-left py-2 px-2 font-medium">Last Post</th>
          <th className="text-center py-2 px-2 font-medium">Doc Split</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr
            key={r.account_number}
            className="border-b border-border/10 hover:bg-surface-alt/30 transition-colors"
          >
            <td className="py-1.5 px-2 text-foreground/90">
              {r.account_number}
            </td>
            <td className="py-1.5 px-2 text-foreground/80">{r.account_name}</td>
            <td className="py-1.5 px-2 text-muted">{r.account_type}</td>
            <td className="py-1.5 px-2 text-muted">{r.naic_group}</td>
            <td className="py-1.5 px-2 text-right text-muted">
              {r.posting_count.toLocaleString()}
            </td>
            <td className="py-1.5 px-2 text-muted">{r.last_posting_date}</td>
            <td className="py-1.5 px-2 text-center">
              {r.doc_split_eligible ? (
                <span className="text-warning">Yes</span>
              ) : (
                <span className="text-muted/40">—</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

const TAB_META: { key: Tab; label: string; count: number }[] = [
  { key: "columns", label: "Columns", count: TB_COLUMNS.length },
  { key: "postings", label: "Postings", count: SAMPLE_POSTINGS.length },
  { key: "accounts", label: "Accounts", count: SAMPLE_ACCOUNTS.length },
];

export function DataPreviewTable() {
  const [tab, setTab] = useState<Tab>("columns");

  return (
    <div className="mt-3 rounded-lg border border-border/30 bg-background/50 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-border/30">
        {TAB_META.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-xs font-medium transition-colors ${
              tab === t.key
                ? "text-foreground border-b-2 border-accent bg-surface/30"
                : "text-muted hover:text-foreground/70"
            }`}
          >
            {t.label}{" "}
            <span className="text-muted/60 font-mono">({t.count})</span>
          </button>
        ))}
        <div className="flex-1" />
        <span className="self-center px-3 text-[10px] text-muted/50 font-mono">
          {tab === "columns"
            ? `${TB_COLUMNS.length} columns`
            : `Preview · first ${tab === "postings" ? SAMPLE_POSTINGS.length : SAMPLE_ACCOUNTS.length} rows`}
        </span>
      </div>

      {/* Table content */}
      <div className="overflow-x-auto">
        {tab === "columns" && <ColumnsTable columns={TB_COLUMNS} />}
        {tab === "postings" && <PostingsTable rows={SAMPLE_POSTINGS} />}
        {tab === "accounts" && <AccountsTable rows={SAMPLE_ACCOUNTS} />}
      </div>
    </div>
  );
}
