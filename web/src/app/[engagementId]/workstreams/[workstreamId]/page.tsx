"use client";

import { useParams } from "next/navigation";
import { MOCK_ENGAGEMENTS } from "@/lib/mock-data";
import { WORKSTREAM_DATA_REQUIREMENTS } from "@/lib/workstream-data-config";
import { WorkstreamDataPanel } from "@/components/workstream/WorkstreamDataPanel";

export default function WorkstreamPage() {
  const params = useParams<{ engagementId: string; workstreamId: string }>();
  const engagement = MOCK_ENGAGEMENTS.find(
    (e) => e.engagement_id === params.engagementId
  );
  const wsConfig = WORKSTREAM_DATA_REQUIREMENTS[params.workstreamId];
  const workstream = engagement?.workplan?.workstreams.find(
    (ws) => ws.workstream_id === params.workstreamId
  );

  if (!engagement || !workstream) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted">
        Workstream not found.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <WorkstreamDataPanel
          engagementId={params.engagementId}
          workstream={workstream}
          config={wsConfig}
        />
      </div>
    </div>
  );
}
