import type {
  AccountProfile,
  AnalysisFinding,
  DimensionalDecision,
  TargetAccount,
  AccountMapping,
  MJEPattern,
  ReconciliationResult,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ---------------------------------------------------------------------------
// Generic fetcher
// ---------------------------------------------------------------------------

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// GET endpoints
// ---------------------------------------------------------------------------

export async function getProfiles(): Promise<AccountProfile[]> {
  try {
    return await fetchJSON<AccountProfile[]>("/api/outcomes/analysis/profiles");
  } catch (err) {
    console.error("Failed to fetch profiles:", err);
    return [];
  }
}

export async function getFindings(): Promise<AnalysisFinding[]> {
  try {
    return await fetchJSON<AnalysisFinding[]>("/api/outcomes/analysis/findings");
  } catch (err) {
    console.error("Failed to fetch findings:", err);
    return [];
  }
}

export async function getDecisions(): Promise<DimensionalDecision[]> {
  try {
    return await fetchJSON<DimensionalDecision[]>("/api/outcomes/design/decisions");
  } catch (err) {
    console.error("Failed to fetch decisions:", err);
    return [];
  }
}

export async function getTargetAccounts(): Promise<TargetAccount[]> {
  try {
    return await fetchJSON<TargetAccount[]>("/api/outcomes/target-coa/accounts");
  } catch (err) {
    console.error("Failed to fetch target accounts:", err);
    return [];
  }
}

export async function getMappings(): Promise<AccountMapping[]> {
  try {
    return await fetchJSON<AccountMapping[]>("/api/outcomes/mapping");
  } catch (err) {
    console.error("Failed to fetch mappings:", err);
    return [];
  }
}

export async function getMJEPatterns(): Promise<MJEPattern[]> {
  try {
    return await fetchJSON<MJEPattern[]>("/api/outcomes/mje/patterns");
  } catch (err) {
    console.error("Failed to fetch MJE patterns:", err);
    return [];
  }
}

export async function getReconciliation(): Promise<ReconciliationResult[]> {
  try {
    return await fetchJSON<ReconciliationResult[]>("/api/outcomes/validation");
  } catch (err) {
    console.error("Failed to fetch reconciliation results:", err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// PATCH endpoints
// ---------------------------------------------------------------------------

export async function patchFinding(
  id: string,
  patch: { status?: string; resolution?: string },
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/outcomes/analysis/findings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    console.error(`Failed to patch finding ${id}: ${res.status}`);
  }
}

export async function patchDecision(
  id: string,
  patch: { status?: string; decided_by?: string },
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/outcomes/design/decisions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    console.error(`Failed to patch decision ${id}: ${res.status}`);
  }
}

export async function patchMapping(
  id: string,
  patch: { status?: string; validated_by?: string },
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/outcomes/mapping/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    console.error(`Failed to patch mapping ${id}: ${res.status}`);
  }
}
