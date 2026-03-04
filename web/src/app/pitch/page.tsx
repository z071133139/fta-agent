import { Suspense } from "react";
import { PitchDeck } from "@/components/pitch/PitchDeck";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "FTA — Pitch Deck",
};

export default function PitchPage() {
  return (
    <Suspense fallback={null}>
      <PitchDeck />
    </Suspense>
  );
}
