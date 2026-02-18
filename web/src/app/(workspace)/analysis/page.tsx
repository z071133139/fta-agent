"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { getFindings, getProfiles } from "@/lib/api";
import DataTable from "@/components/DataTable";
import SummaryCard from "@/components/SummaryCard";
import SeverityBadge from "@/components/SeverityBadge";
import StatusBadge from "@/components/StatusBadge";
import FilterBar from "@/components/FilterBar";
import type {
  AnalysisFinding,
  AccountProfile,
  FindingSeverity,
  FindingStatus,
} from "@/lib/types";

const findingColumns: ColumnDef<AnalysisFinding>[] = [
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ getValue }) => (
      <SeverityBadge severity={getValue<FindingSeverity>()} />
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "affected_count",
    header: "Affected",
  },
  {
    accessorKey: "recommendation_category",
    header: "Recommendation",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => (
      <StatusBadge status={getValue<FindingStatus>()} />
    ),
  },
];

const profileColumns: ColumnDef<AccountProfile>[] = [
  {
    accessorKey: "gl_account",
    header: "GL Account",
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
    accessorKey: "posting_count",
    header: "Postings",
  },
  {
    accessorKey: "avg_balance",
    header: "Avg Balance",
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
    accessorKey: "is_active",
    header: "Active",
    cell: ({ getValue }) => (
      <span className={getValue<boolean>() ? "text-success" : "text-muted"}>
        {getValue<boolean>() ? "Yes" : "No"}
      </span>
    ),
  },
  {
    accessorKey: "is_mje_target",
    header: "MJE Target",
    cell: ({ getValue }) => (
      <span className={getValue<boolean>() ? "text-warning" : "text-muted"}>
        {getValue<boolean>() ? "Yes" : "No"}
      </span>
    ),
  },
];

const severityFilterOptions = ["CRIT", "HIGH", "MED", "LOW", "INFO"];

const categoryFilterOptions = [
  "INACTIVE",
  "DIM_GAP",
  "STRUCTURE",
  "REG_GAP",
  "CLASSIF",
  "NAMING",
  "DUPLICATE",
  "MJE_ROOT",
];

export default function AnalysisPage() {
  const [findings, setFindings] = useState<AnalysisFinding[]>([]);
  const [profiles, setProfiles] = useState<AccountProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfiles, setShowProfiles] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const [f, p] = await Promise.all([getFindings(), getProfiles()]);
        setFindings(f);
        setProfiles(p);
      } catch (err) {
        console.error("Failed to fetch analysis data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredFindings = findings.filter((f) => {
    if (activeFilters.severity && f.severity !== activeFilters.severity) {
      return false;
    }
    if (activeFilters.category && f.category !== activeFilters.category) {
      return false;
    }
    return true;
  });

  const critCount = findings.filter((f) => f.severity === "CRIT").length;
  const highCount = findings.filter((f) => f.severity === "HIGH").length;
  const medCount = findings.filter((f) => f.severity === "MED").length;
  const lowCount = findings.filter((f) => f.severity === "LOW").length;
  const infoCount = findings.filter((f) => f.severity === "INFO").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted text-lg">Loading analysis...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Current State Analysis</h1>
        <p className="text-muted mt-1">Findings and account profiling results</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <SummaryCard title="Total Findings" value={findings.length} />
        <SummaryCard title="Critical" value={critCount} subtitle="Immediate action" />
        <SummaryCard title="High" value={highCount} subtitle="Should address" />
        <SummaryCard title="Medium" value={medCount} />
        <SummaryCard title="Low" value={lowCount} />
        <SummaryCard title="Info" value={infoCount} />
      </div>

      {/* Findings Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Findings</h2>
        <FilterBar
          filters={[
            { key: "severity", label: "Severity", options: severityFilterOptions },
            { key: "category", label: "Category", options: categoryFilterOptions },
          ]}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
        />
        <DataTable data={filteredFindings} columns={findingColumns} />
      </div>

      {/* Account Profiles (collapsible) */}
      <div className="space-y-4">
        <button
          onClick={() => setShowProfiles(!showProfiles)}
          className="flex items-center gap-2 text-xl font-semibold hover:text-accent transition-colors"
        >
          <span className="text-sm">{showProfiles ? "\u25BC" : "\u25B6"}</span>
          Account Profiles ({profiles.length})
        </button>
        {showProfiles && (
          <DataTable data={profiles} columns={profileColumns} />
        )}
      </div>
    </div>
  );
}
