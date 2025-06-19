import { create } from "zustand";

type SidebarStore = {
  loadingStates: boolean[];
  setLoadingStates: (states: boolean[]) => void;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (sidebarOpen: boolean) => void;
};

export const useSidebarStore = create<SidebarStore>((set) => ({
  loadingStates: [],
  setLoadingStates: (states) => set({ loadingStates: states, isLoading: states.some((s) => s) }),
  isLoading: true,
  error: null,
  sidebarOpen: false,
  setError: (error: string | null) => set({ error }),
  setSidebarOpen: (sidebarOpen: boolean) => set({ sidebarOpen }),
}));
