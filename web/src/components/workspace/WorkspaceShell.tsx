"use client";

import { useEffect, useCallback, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Engagement } from "@/lib/mock-data";
import { isWorkshopEligible } from "@/lib/mock-data";
import { useWorkshopStore } from "@/lib/workshop-store";
import WorkplanSpine from "./WorkplanSpine";

export default function WorkspaceShell({
  engagement,
  children,
}: {
  engagement: Engagement;
  children: ReactNode;
}) {
  const params = useParams<{ deliverableId?: string }>();
  const workshopMode = useWorkshopStore((s) => s.workshopMode);
  const endWorkshop = useWorkshopStore((s) => s.endWorkshop);

  const eligible = params.deliverableId
    ? isWorkshopEligible(params.deliverableId)
    : false;

  const isWorkshopActive = workshopMode && eligible;

  // Cmd+E exits workshop mode (entering requires PA selection via TopBar)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isWorkshopActive) return;

      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === "e") {
        e.preventDefault();
        endWorkshop();
      }
    },
    [isWorkshopActive, endWorkshop]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-1 overflow-hidden">
      <AnimatePresence initial={false}>
        {!isWorkshopActive && (
          <motion.div
            key="workplan-spine"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="shrink-0 overflow-hidden"
          >
            <WorkplanSpine engagement={engagement} />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-1 min-w-0 overflow-hidden">{children}</div>
    </div>
  );
}
