"use client";

import { useState } from "react";
import {
  SAMPLE_POSTINGS,
  SAMPLE_ACCOUNTS,
  type PostingRecord,
  type AccountMasterRecord,
} from "@/lib/data-store";

type Tab = "postings" | "accounts";

function formatAmount(n: number): string {
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return n < 0 ? `(${formatted})` : formatted;
}

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

export function DataPreviewTable() {
  const [tab, setTab] = useState<Tab>("postings");

  return (
    <div className="mt-3 rounded-lg border border-border/30 bg-background/50 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-border/30">
        {(["postings", "accounts"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-medium transition-colors ${
              tab === t
                ? "text-foreground border-b-2 border-accent bg-surface/30"
                : "text-muted hover:text-foreground/70"
            }`}
          >
            {t === "postings" ? "Postings" : "Accounts"}{" "}
            <span className="text-muted/60 font-mono">
              ({t === "postings" ? SAMPLE_POSTINGS.length : SAMPLE_ACCOUNTS.length})
            </span>
          </button>
        ))}
        <div className="flex-1" />
        <span className="self-center px-3 text-[10px] text-muted/50 font-mono">
          Preview · first {tab === "postings" ? 15 : 15} rows
        </span>
      </div>

      {/* Table content */}
      <div className="overflow-x-auto">
        {tab === "postings" ? (
          <PostingsTable rows={SAMPLE_POSTINGS} />
        ) : (
          <AccountsTable rows={SAMPLE_ACCOUNTS} />
        )}
      </div>
    </div>
  );
}
