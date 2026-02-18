"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { getMJEPatterns } from "@/lib/api";
import DataTable from "@/components/DataTable";
import SummaryCard from "@/components/SummaryCard";
import type { MJEPattern } from "@/lib/types";

function OptimizationBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ELIM: "bg-success/20 text-success",
    AUTO: "bg-accent/20 text-accent",
    RESIDUAL: "bg-surface text-muted",
  };

  const labels: Record<string, string> = {
    ELIM: "Eliminable",
    AUTO: "Automatable",
    RESIDUAL: "Residual",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[status] ?? "bg-surface text-muted"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}

const columns: ColumnDef<MJEPattern>[] = [
  {
    accessorKey: "pattern_type",
    header: "Pattern Type",
    cell: ({ getValue }) => {
      const labels: Record<string, string> = {
        RECUR_ID: "Recurring Identical",
        RECUR_TPL: "Recurring Template",
        RECLASS: "Reclassification",
        IC: "Intercompany",
        ACCREV: "Accrual/Reversal",
        CORRECT: "Correction",
        CONSOL: "Consolidation",
      };
      const val = getValue<string>();
      return labels[val] ?? val;
    },
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "frequency",
    header: "Frequency",
    cell: ({ getValue }) => (
      <span className="capitalize">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "annual_dollar_volume",
    header: "Annual Volume",
    cell: ({ getValue }) => {
      const val = getValue<number>();
      return val.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      });
    },
  },
  {
    accessorKey: "is_single_preparer",
    header: "Single Preparer",
    cell: ({ getValue }) => (
      <span className={getValue<boolean>() ? "text-warning" : "text-muted"}>
        {getValue<boolean>() ? "Yes" : "No"}
      </span>
    ),
  },
  {
    accessorKey: "optimization_status",
    header: "Optimization",
    cell: ({ getValue }) => <OptimizationBadge status={getValue<string>()} />,
  },
  {
    accessorKey: "estimated_entries_eliminated",
    header: "Est. Entries Saved",
  },
];

export default function MJEPage() {
  const [patterns, setPatterns] = useState<MJEPattern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getMJEPatterns();
        setPatterns(data);
      } catch (err) {
        console.error("Failed to fetch MJE patterns:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalPatterns = patterns.length;
  const eliminableCount = patterns.filter((p) => p.optimization_status === "ELIM").length;
  const automatableCount = patterns.filter((p) => p.optimization_status === "AUTO").length;
  const residualCount = patterns.filter((p) => p.optimization_status === "RESIDUAL").length;
  const estimatedSaved = patterns.reduce((sum, p) => sum + p.estimated_entries_eliminated, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted text-lg">Loading MJE patterns...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">MJE Analysis</h1>
        <p className="text-muted mt-1">
          Manual journal entry patterns and optimization potential
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <SummaryCard title="Total Patterns" value={totalPatterns} />
        <SummaryCard title="Eliminable" value={eliminableCount} subtitle="Removed by COA redesign" />
        <SummaryCard title="Automatable" value={automatableCount} subtitle="Can be automated" />
        <SummaryCard title="Residual" value={residualCount} subtitle="Legitimate, stays" />
        <SummaryCard
          title="Est. Annual Entries Saved"
          value={estimatedSaved.toLocaleString()}
          subtitle="Across all patterns"
        />
      </div>

      <DataTable data={patterns} columns={columns} />
    </div>
  );
}
