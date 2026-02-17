"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { getTargetAccounts } from "@/lib/api";
import DataTable from "@/components/DataTable";
import SummaryCard from "@/components/SummaryCard";
import type { TargetAccount } from "@/lib/types";

const columns: ColumnDef<TargetAccount>[] = [
  {
    accessorKey: "gl_account",
    header: "GL Account",
    cell: ({ getValue }) => (
      <span className="font-mono">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "account_type",
    header: "Type",
  },
  {
    accessorKey: "account_group",
    header: "Group",
  },
  {
    accessorKey: "naic_line",
    header: "NAIC Line",
    cell: ({ getValue }) => getValue<string>() ?? "--",
  },
  {
    accessorKey: "functional_area",
    header: "Functional Area",
    cell: ({ getValue }) => getValue<string>() ?? "--",
  },
  {
    accessorKey: "is_new",
    header: "New",
    cell: ({ getValue }) =>
      getValue<boolean>() ? (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent/20 text-accent">
          NEW
        </span>
      ) : null,
  },
  {
    accessorKey: "recommendation_category",
    header: "Recommendation",
    cell: ({ getValue }) => {
      const val = getValue<string>();
      const styles: Record<string, string> = {
        MUST_DO: "text-error",
        WORTH_IT: "text-warning",
        PARK_IT: "text-muted",
        DONT_TOUCH: "text-muted",
      };
      const labels: Record<string, string> = {
        MUST_DO: "Must Do",
        WORTH_IT: "Worth It",
        PARK_IT: "Park It",
        DONT_TOUCH: "Don't Touch",
      };
      return (
        <span className={styles[val] ?? "text-muted"}>
          {labels[val] ?? val}
        </span>
      );
    },
  },
];

export default function TargetCOAPage() {
  const [accounts, setAccounts] = useState<TargetAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getTargetAccounts();
        setAccounts(data);
      } catch (err) {
        console.error("Failed to fetch target accounts:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalAccounts = accounts.length;
  const newCount = accounts.filter((a) => a.is_new).length;
  const mappedCount = totalAccounts - newCount;

  // Sort by account_type for grouping
  const sortedAccounts = [...accounts].sort((a, b) =>
    a.account_type.localeCompare(b.account_type)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted text-lg">Loading target COA...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Target Chart of Accounts</h1>
        <p className="text-muted mt-1">
          Proposed account structure with NAIC alignment
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard title="Total Accounts" value={totalAccounts} />
        <SummaryCard title="New Accounts" value={newCount} subtitle="Created for target COA" />
        <SummaryCard title="Mapped from Legacy" value={mappedCount} subtitle="Carried over" />
      </div>

      <DataTable data={sortedAccounts} columns={columns} />
    </div>
  );
}
