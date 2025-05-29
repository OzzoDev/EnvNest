import { create } from "zustand";
import { persist } from "zustand/middleware";

type ProjectStore = {
  projectId: number | null;
  setProjectId: (id: number) => void;
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  isSaved: boolean;
  setIsSaved: (isSaved: boolean) => void;
};

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projectId: null,
      hasHydrated: false,
      isSaved: true,
      setProjectId: (projectId: number) => set({ projectId }),
      setHasHydrated: (hasHydrated: boolean) => set({ hasHydrated }),
      setIsSaved: (isSaved: boolean) => set({ isSaved }),
    }),
    {
      name: "project-store",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
