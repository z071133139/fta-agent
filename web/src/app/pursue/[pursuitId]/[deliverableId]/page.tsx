"use client";

import { useParams } from "next/navigation";
import { ScopingCanvas } from "@/components/pursue/ScopingCanvas";

export const dynamic = "force-dynamic";

export default function PursuitDeliverablePage() {
  const { deliverableId } = useParams<{ pursuitId: string; deliverableId: string }>();

  // For now, only the Scoping Canvas (p-001-01) has a dedicated component.
  // Other pursuit deliverables will get their own components later.
  if (deliverableId === "p-001-01") {
    return <ScopingCanvas />;
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-sm text-muted">
        This deliverable is not yet available.
      </p>
    </div>
  );
}
