import type { DataFile } from "./data-store";

export interface WorkstreamFileRequirement {
  type: DataFile["type"];
  label: string;
  description: string;
  required_for: string[]; // deliverable IDs
  sample_satisfies: boolean;
}

export interface WorkstreamDataRequirements {
  workstream_id: string;
  workstream_name: string;
  requirements: WorkstreamFileRequirement[];
}

/** Declarative data requirements per workstream */
export const WORKSTREAM_DATA_REQUIREMENTS: Record<
  string,
  WorkstreamDataRequirements
> = {
  "ws-005": {
    workstream_id: "ws-005",
    workstream_name: "COA & GL Design",
    requirements: [
      {
        type: "trial_balance",
        label: "Trial Balance",
        description:
          "Full GL trial balance extract from source system. Contains account balances, posting volumes, and dimensional breakdowns needed for profiling and analysis.",
        required_for: ["d-005-01", "d-005-02", "d-005-03", "d-005-04"],
        sample_satisfies: true,
      },
      {
        type: "coa_extract",
        label: "COA Extract",
        description:
          "Current chart of accounts export with account hierarchy, groups, and attributes. Used to design the target COA structure and build legacy-to-new mappings.",
        required_for: ["d-005-02", "d-005-03"],
        sample_satisfies: false,
      },
    ],
  },
};

/** Map deliverable IDs to display names (used outside of workplan context) */
export const DELIVERABLE_NAMES: Record<string, string> = {
  "d-005-01": "Account Analysis",
  "d-005-02": "COA Design",
  "d-005-03": "Account Mapping",
  "d-005-04": "Dimension Design",
  "d-005-05": "Document Splitting",
  "d-005-06": "P&C Account Groups",
};
