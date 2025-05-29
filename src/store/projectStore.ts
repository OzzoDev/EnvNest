import { create } from "zustand";
import { persist } from "zustand/middleware";

type ProjectStore = {
  projectId: number | null;
  setProjectId: (id: number) => void;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
};

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projectId: null,
      hasHydrated: false,
      setProjectId: (id: number) => set({ projectId: id }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "project-store",
    }
  )
);
