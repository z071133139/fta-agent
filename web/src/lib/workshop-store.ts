import { create } from "zustand";

interface WorkshopSession {
  facilitator: string;
  processAreaId: string;
  processAreaName: string;
  startedAt: string;
  lockedItems: Set<string>;
}

interface WorkshopState {
  workshopMode: boolean;
  workshopSession: WorkshopSession | null;

  startWorkshop: (processAreaId: string, processAreaName: string) => void;
  endWorkshop: () => void;
  lockItem: (itemId: string) => void;
  unlockItem: (itemId: string) => void;
}

export const useWorkshopStore = create<WorkshopState>((set, get) => ({
  workshopMode: false,
  workshopSession: null,

  startWorkshop: (processAreaId: string, processAreaName: string) => {
    set({
      workshopMode: true,
      workshopSession: {
        facilitator: "current-user",
        processAreaId,
        processAreaName,
        startedAt: new Date().toISOString(),
        lockedItems: new Set(),
      },
    });
  },

  endWorkshop: () => {
    set({ workshopMode: false, workshopSession: null });
  },

  lockItem: (itemId: string) => {
    const session = get().workshopSession;
    if (!session) return;
    const next = new Set(session.lockedItems);
    next.add(itemId);
    set({ workshopSession: { ...session, lockedItems: next } });
  },

  unlockItem: (itemId: string) => {
    const session = get().workshopSession;
    if (!session) return;
    const next = new Set(session.lockedItems);
    next.delete(itemId);
    set({ workshopSession: { ...session, lockedItems: next } });
  },
}));
