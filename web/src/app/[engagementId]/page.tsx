"use client";

import { useParams } from "next/navigation";
import { MOCK_ENGAGEMENTS } from "@/lib/mock-data";
import { EngagementOverview } from "@/components/engagement/EngagementOverview";
import { DataSourcesPanel } from "@/components/engagement/DataSourcesPanel";

export default function EngagementDashboard() {
  const params = useParams<{ engagementId: string }>();
  const engagement = MOCK_ENGAGEMENTS.find(
    (e) => e.engagement_id === params.engagementId
  );

  if (!engagement) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted">
        Engagement not found.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <EngagementOverview engagement={engagement} />
        <DataSourcesPanel engagementId={engagement.engagement_id} />
      </div>
    </div>
  );
}
