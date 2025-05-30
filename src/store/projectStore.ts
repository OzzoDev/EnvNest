import { ProjectSecret } from "@/types/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ProjectStore = {
  projectId: number | null;
  setProjectId: (id: number | null) => void;
  project: ProjectSecret | null;
  setProject: (projectSecret: ProjectSecret | null) => void;
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  isSaved: boolean;
  setIsSaved: (isSaved: boolean) => void;
};

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projectId: null,
      project: null,
      hasHydrated: false,
      isSaved: true,
      setProjectId: (projectId: number | null) => set({ projectId }),
      setProject: (project: ProjectSecret | null) => set({ project }),
      setHasHydrated: (hasHydrated: boolean) => set({ hasHydrated }),
      setIsSaved: (isSaved: boolean) => set({ isSaved }),
    }),
    {
      name: "project-store",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        state?.setIsSaved(true);
      },
    }
  )
);
