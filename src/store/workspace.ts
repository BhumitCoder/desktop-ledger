import { create } from "zustand";

export interface Tab {
  id: string;
  title: string;
  path: string;
}

interface WorkspaceState {
  tabs: Tab[];
  activeId: string | null;
  openTab: (tab: Tab) => void;
  closeTab: (id: string) => void;
  setActive: (id: string) => void;
  globalSearchOpen: boolean;
  setGlobalSearch: (v: boolean) => void;
  quickAddOpen: null | "sale" | "purchase";
  setQuickAdd: (v: null | "sale" | "purchase") => void;
}

export const useWorkspace = create<WorkspaceState>((set, get) => ({
  tabs: [],
  activeId: null,
  globalSearchOpen: false,
  quickAddOpen: null,
  openTab: (tab) => {
    const exists = get().tabs.find((t) => t.id === tab.id);
    if (exists) {
      set({ activeId: tab.id });
    } else {
      set({ tabs: [...get().tabs, tab], activeId: tab.id });
    }
  },
  closeTab: (id) => {
    const tabs = get().tabs.filter((t) => t.id !== id);
    const activeId =
      get().activeId === id ? (tabs[tabs.length - 1]?.id ?? null) : get().activeId;
    set({ tabs, activeId });
  },
  setActive: (id) => set({ activeId: id }),
  setGlobalSearch: (v) => set({ globalSearchOpen: v }),
  setQuickAdd: (v) => set({ quickAddOpen: v }),
}));
