import { EnvironmentSecret, ProjectTable } from "@/types/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ProjectStore = {
  projectId: number | null;
  setProjectId: (id: number | null) => void;
  project: ProjectTable | null;
  setProject: (project: ProjectTable | null) => void;
  secret: EnvironmentSecret | null;
  setSecret: (projectSecret: EnvironmentSecret | null) => void;
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  isSaved: boolean;
  setIsSaved: (isSaved: boolean) => void;
  secretId: number | null;
  setSecretId: (secretId: number | null) => void;
  clearStore: () => void;
};

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projectId: null,
      project: null,
      secret: null,
      hasHydrated: false,
      isSaved: true,
      secretId: null,
      setProjectId: (projectId: number | null) => set({ projectId }),
      setSecret: (secret: EnvironmentSecret | null) => set({ secret }),
      setProject: (project: ProjectTable | null) => set({ project }),
      setHasHydrated: (hasHydrated: boolean) => set({ hasHydrated }),
      setIsSaved: (isSaved: boolean) => set({ isSaved }),
      setSecretId: (secretId: number | null) => set({ secretId }),

      clearStore: () =>
        set({
          projectId: null,
          project: null,
          secret: null,
          hasHydrated: false,
          isSaved: true,
          secretId: null,
        }),
    }),
    {
      name: "project-store",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        state?.setIsSaved(true);
        state?.clearStore();
      },
    }
  )
);
