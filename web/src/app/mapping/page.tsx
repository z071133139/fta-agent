"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { getMappings } from "@/lib/api";
import DataTable from "@/components/DataTable";
import SummaryCard from "@/components/SummaryCard";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import FilterBar from "@/components/FilterBar";
import type { AccountMapping, MappingConfidence, MappingStatus } from "@/lib/types";

function MappingStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    AUTO: "bg-accent/20 text-accent",
    VALIDATED: "bg-success/20 text-success",
    REJECTED: "bg-error/20 text-error",
    MANUAL: "bg-purple/20 text-purple",
  };

  const labels: Record<string, string> = {
    AUTO: "Auto",
    VALIDATED: "Validated",
    REJECTED: "Rejected",
    MANUAL: "Manual",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[status] ?? "bg-surface text-muted"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}

const columns: ColumnDef<AccountMapping>[] = [
  {
    accessorKey: "legacy_account",
    header: "Legacy Account",
    cell: ({ getValue }) => (
      <span className="font-mono">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "legacy_description",
    header: "Legacy Description",
  },
  {
    id: "arrow",
    header: "",
    cell: () => <span className="text-muted font-bold">-&gt;</span>,
  },
  {
    accessorKey: "target_account",
    header: "Target Account",
    cell: ({ getValue }) => (
      <span className="font-mono">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "target_description",
    header: "Target Description",
  },
  {
    accessorKey: "confidence",
    header: "Confidence",
    cell: ({ getValue }) => (
      <ConfidenceBadge confidence={getValue<MappingConfidence>()} />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => (
      <MappingStatusBadge status={getValue<string>()} />
    ),
  },
];

const confidenceFilterOptions = ["HIGH", "MED", "LOW"];

const statusFilterOptions = ["AUTO", "VALIDATED", "REJECTED", "MANUAL"];

export default function MappingPage() {
  const [mappings, setMappings] = useState<AccountMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getMappings();
        setMappings(data);
      } catch (err) {
        console.error("Failed to fetch mappings:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredMappings = mappings.filter((m) => {
    if (activeFilters.confidence && m.confidence !== activeFilters.confidence) {
      return false;
    }
    if (activeFilters.status && m.status !== activeFilters.status) {
      return false;
    }
    return true;
  });

  const totalMappings = mappings.length;
  const validatedCount = mappings.filter((m) => m.status === "VALIDATED").length;
  const validatedPercent = totalMappings > 0
    ? ((validatedCount / totalMappings) * 100).toFixed(1)
    : "0";

  const highConfidence = mappings.filter((m) => m.confidence === "HIGH").length;
  const medConfidence = mappings.filter((m) => m.confidence === "MED").length;
  const lowConfidence = mappings.filter((m) => m.confidence === "LOW").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted text-lg">Loading mappings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Account Mapping</h1>
        <p className="text-muted mt-1">
          Legacy-to-target account crosswalk
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <SummaryCard title="Total Mappings" value={totalMappings} />
        <SummaryCard title="Validated" value={`${validatedPercent}%`} subtitle={`${validatedCount} of ${totalMappings}`} />
        <SummaryCard title="High Confidence" value={highConfidence} />
        <SummaryCard title="Medium Confidence" value={medConfidence} />
        <SummaryCard title="Low Confidence" value={lowConfidence} />
      </div>

      {/* Mapping Table */}
      <div className="space-y-4">
        <FilterBar
          filters={[
            { key: "confidence", label: "Confidence", options: confidenceFilterOptions },
            { key: "status", label: "Status", options: statusFilterOptions },
          ]}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
        />
        <DataTable data={filteredMappings} columns={columns} />
      </div>
    </div>
  );
}
