import { EnvironmentSecret, ProjectTable } from "@/types/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ProjectSecretRefs = {
  [projectId: number]: number;
};

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
  projectSecretRefs: ProjectSecretRefs;
  addProjectSecretRefs: (projectId: number, secretId: number) => void;
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
      projectSecretRefs: {},
      setProjectId: (projectId: number | null) => set({ projectId }),
      setSecret: (secret: EnvironmentSecret | null) => set({ secret }),
      setProject: (project: ProjectTable | null) => set({ project }),
      setHasHydrated: (hasHydrated: boolean) => set({ hasHydrated }),
      setIsSaved: (isSaved: boolean) => set({ isSaved }),
      setSecretId: (secretId: number | null) => set({ secretId }),
      addProjectSecretRefs: (projectId, secretId) =>
        set((state) => ({
          projectSecretRefs: {
            ...state.projectSecretRefs,
            [projectId]: secretId,
          },
        })),
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
      },
    }
  )
);
