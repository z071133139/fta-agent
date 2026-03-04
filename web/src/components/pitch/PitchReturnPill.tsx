"use client";

import { useSearchParams, useRouter } from "next/navigation";

export function PitchReturnPill() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const fromPitch = searchParams.get("from") === "pitch";
  const slide = searchParams.get("slide");

  if (!fromPitch) return null;

  const returnUrl = slide ? `/pitch?slide=${slide}` : "/pitch";

  return (
    <button
      onClick={() => router.push(returnUrl)}
      className="fixed top-3 right-3 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border/50 hover:border-info/40 hover:bg-surface-alt transition-all text-xs font-mono text-muted hover:text-info cursor-pointer shadow-lg"
    >
      <span className="text-info/60">&larr;</span>
      Back to deck
    </button>
  );
}
