import { useEffect } from "react";
import type { RefObject } from "react";
import { useWorkshopStore } from "@/lib/workshop-store";
import type { CaptureBarHandle } from "@/components/workspace/CaptureBar";

/**
 * Global keyboard shortcuts for workshop mode.
 * R/N/G/A focus the capture bar with prefix.
 * Y accepts first suggestion in insight panel.
 * Escape deselects or blurs.
 * Cmd+K opens command palette.
 * Only active when workshopMode === true.
 * Skips when focus is in text inputs.
 */
export function useWorkshopKeyboard(
  captureBarRef: RefObject<CaptureBarHandle | null>
) {
  const workshopMode = useWorkshopStore((s) => s.workshopMode);
  const selectRequirement = useWorkshopStore((s) => s.selectRequirement);
  const toggleCommandPalette = useWorkshopStore((s) => s.toggleCommandPalette);
  const commandPaletteOpen = useWorkshopStore((s) => s.commandPaletteOpen);

  useEffect(() => {
    if (!workshopMode) return;

    const onKeyDown = (e: KeyboardEvent) => {
      // Cmd+K → command palette (works even in inputs)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }

      // If command palette is open, don't process other shortcuts
      if (commandPaletteOpen) return;

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

      // Y key is handled by individual components (BRT insight panel, Agentic Bridges)
      // Esc for deselect
      if (e.key === "Escape") {
        selectRequirement(null);
        captureBarRef.current?.blur();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [workshopMode, captureBarRef, selectRequirement, toggleCommandPalette, commandPaletteOpen]);
}
