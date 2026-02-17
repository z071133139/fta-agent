"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { getDecisions } from "@/lib/api";
import DataTable from "@/components/DataTable";
import type { DimensionalDecision } from "@/lib/types";

function DecisionStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PROPOSED: "bg-accent/20 text-accent",
    PENDING: "bg-warning/20 text-warning",
    DECIDED: "bg-success/20 text-success",
    REVISED: "bg-purple/20 text-purple",
  };

  const labels: Record<string, string> = {
    PROPOSED: "Proposed",
    PENDING: "Pending",
    DECIDED: "Decided",
    REVISED: "Revised",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[status] ?? "bg-surface text-muted"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}

function parseDownstreamCount(json: string): number {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

const columns: ColumnDef<DimensionalDecision>[] = [
  {
    accessorKey: "dimension",
    header: "Dimension",
  },
  {
    accessorKey: "acdoca_field",
    header: "ACDOCA Field",
    cell: ({ getValue }) => (
      <span className="font-mono text-sm">{getValue<string>() ?? "--"}</span>
    ),
  },
  {
    accessorKey: "design_choice",
    header: "Design Choice",
    cell: ({ getValue }) => {
      const val = getValue<string>();
      const truncated = val.length > 60 ? val.slice(0, 60) + "..." : val;
      return <span title={val}>{truncated}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => <DecisionStatusBadge status={getValue<string>()} />,
  },
  {
    accessorKey: "rationale",
    header: "Rationale",
    cell: ({ getValue }) => {
      const val = getValue<string>();
      const truncated = val.length > 80 ? val.slice(0, 80) + "..." : val;
      return <span title={val} className="text-muted">{truncated}</span>;
    },
  },
  {
    accessorKey: "downstream_impacts",
    header: "Impacts",
    cell: ({ getValue }) => {
      const count = parseDownstreamCount(getValue<string>());
      return (
        <span className="text-muted">
          {count} {count === 1 ? "impact" : "impacts"}
        </span>
      );
    },
  },
];

export default function DesignPage() {
  const [decisions, setDecisions] = useState<DimensionalDecision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getDecisions();
        setDecisions(data);
      } catch (err) {
        console.error("Failed to fetch decisions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted text-lg">Loading design decisions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Code Block Design</h1>
        <p className="text-muted mt-1">
          Dimensional design decisions for the target chart of accounts
        </p>
      </div>

      <DataTable data={decisions} columns={columns} />
    </div>
  );
}
