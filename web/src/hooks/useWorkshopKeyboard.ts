import { useEffect } from "react";
import type { RefObject } from "react";
import { useWorkshopStore } from "@/lib/workshop-store";
import type { CaptureBarHandle } from "@/components/workspace/CaptureBar";

/**
 * Global keyboard shortcuts for workshop mode.
 * R/N/G/A focus the capture bar with prefix.
 * Escape deselects or blurs.
 * Only active when workshopMode === true.
 * Skips when focus is in text inputs.
 */
export function useWorkshopKeyboard(
  captureBarRef: RefObject<CaptureBarHandle | null>
) {
  const workshopMode = useWorkshopStore((s) => s.workshopMode);
  const selectRequirement = useWorkshopStore((s) => s.selectRequirement);

  useEffect(() => {
    if (!workshopMode) return;

    const onKeyDown = (e: KeyboardEvent) => {
      // Skip when typing in inputs/textareas
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement).isContentEditable) return;

      const key = e.key.toUpperCase();

      if (key === "R" || key === "N" || key === "G" || key === "A") {
        e.preventDefault();
        captureBarRef.current?.focus(key);
        return;
      }

      if (e.key === "Escape") {
        selectRequirement(null);
        captureBarRef.current?.blur();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [workshopMode, captureBarRef, selectRequirement]);
}
