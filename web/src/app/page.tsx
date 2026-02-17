"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getFindings, getProfiles, getDecisions, getMappings, getMJEPatterns } from "@/lib/api";
import SummaryCard from "@/components/SummaryCard";
import type { AnalysisFinding, AccountProfile, DimensionalDecision, AccountMapping, MJEPattern } from "@/lib/types";

const quickLinks = [
  {
    href: "/analysis",
    title: "Current State Analysis",
    description: "Account profiling, findings, and structural observations.",
  },
  {
    href: "/design",
    title: "Code Block Design",
    description: "Dimensional design decisions for the target COA.",
  },
  {
    href: "/target-coa",
    title: "Target COA",
    description: "Proposed chart of accounts with NAIC alignment.",
  },
  {
    href: "/mapping",
    title: "Account Mapping",
    description: "Legacy-to-target account crosswalk and validation status.",
  },
  {
    href: "/mje",
    title: "MJE Analysis",
    description: "Manual journal entry patterns and optimization potential.",
  },
  {
    href: "/validation",
    title: "Validation",
    description: "OLD=NEW reconciliation proof (coming soon).",
  },
];

export default function HomePage() {
  const [findings, setFindings] = useState<AnalysisFinding[]>([]);
  const [profiles, setProfiles] = useState<AccountProfile[]>([]);
  const [decisions, setDecisions] = useState<DimensionalDecision[]>([]);
  const [mappings, setMappings] = useState<AccountMapping[]>([]);
  const [mjePatterns, setMJEPatterns] = useState<MJEPattern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [f, p, d, m, mje] = await Promise.all([
          getFindings(),
          getProfiles(),
          getDecisions(),
          getMappings(),
          getMJEPatterns(),
        ]);
        setFindings(f);
        setProfiles(p);
        setDecisions(d);
        setMappings(m);
        setMJEPatterns(mje);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalAccounts = profiles.length;
  const activePercent = totalAccounts > 0
    ? ((profiles.filter((p) => p.is_active).length / totalAccounts) * 100).toFixed(1)
    : "0";
  const findingsCount = findings.length;
  const decisionsCount = decisions.length;
  const validatedMappings = mappings.filter((m) => m.status === "VALIDATED").length;
  const mappingProgress = mappings.length > 0
    ? ((validatedMappings / mappings.length) * 100).toFixed(1)
    : "0";
  const mjeCount = mjePatterns.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Engagement Overview</h1>
        <p className="text-muted mt-1">P&C Insurance COA Design Dashboard</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <SummaryCard title="Total Accounts" value={totalAccounts} />
        <SummaryCard title="Active %" value={`${activePercent}%`} />
        <SummaryCard title="Findings" value={findingsCount} />
        <SummaryCard title="Decisions Made" value={decisionsCount} />
        <SummaryCard title="Mapping Progress" value={`${mappingProgress}%`} />
        <SummaryCard title="MJE Patterns" value={mjeCount} />
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <div className="bg-surface hover:bg-surface-hover p-4 rounded-lg transition-colors cursor-pointer">
                <h3 className="text-foreground font-medium">{link.title}</h3>
                <p className="text-muted text-sm mt-1">{link.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
