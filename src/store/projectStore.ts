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
  deleteProjectSecretRef: (projectId: number) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
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
      isLoading: false,
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
      deleteProjectSecretRef: (projectId) =>
        set((state) => {
          const { [projectId]: _, ...rest } = state.projectSecretRefs;
          return { projectSecretRefs: rest };
        }),
      setIsLoading: (isLoading: boolean) => set({ isLoading }),
      clearStore: () =>
        set({
          projectId: null,
          project: null,
          secret: null,
          hasHydrated: false,
          isSaved: true,
          secretId: null,
          projectSecretRefs: {},
          isLoading: false,
        }),
    }),
    {
      name: "project-store",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        state?.setIsSaved(true);
        state?.setIsLoading(false);
        // state?.clearStore();
      },
    }
  )
);
