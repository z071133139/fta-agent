import { notFound } from "next/navigation";
import { MOCK_ENGAGEMENTS } from "@/lib/mock-data";
import WorkplanSpine from "@/components/workspace/WorkplanSpine";
import WorkspaceTopBar from "@/components/workspace/WorkspaceTopBar";

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
      <WorkspaceTopBar engagement={engagement} />
      <div className="flex flex-1 overflow-hidden">
        <WorkplanSpine engagement={engagement} />
        <div className="flex flex-1 min-w-0 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
