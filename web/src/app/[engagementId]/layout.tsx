import { Suspense } from "react";
import { notFound } from "next/navigation";
import { MOCK_ENGAGEMENTS } from "@/lib/mock-data";
import WorkspaceTopBar from "@/components/workspace/WorkspaceTopBar";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import { PitchReturnPill } from "@/components/pitch/PitchReturnPill";

export default async function EngagementLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ engagementId: string }>;
}) {
  const { engagementId } = await params;
  const engagement = MOCK_ENGAGEMENTS.find(
    (e) => e.engagement_id === engagementId
  );
  if (!engagement) notFound();

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Suspense fallback={null}>
        <PitchReturnPill />
      </Suspense>
      <WorkspaceTopBar engagement={engagement} />
      <WorkspaceShell engagement={engagement}>{children}</WorkspaceShell>
    </div>
  );
}
