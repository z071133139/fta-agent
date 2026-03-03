"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EngagementDashboard() {
  const params = useParams<{ engagementId: string }>();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/?eng=${params.engagementId}`);
  }, [params.engagementId, router]);

  return null;
}
