import { EnvironmentSecret, ProjectTable, ProjectWithRole } from "@/types/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ProjectSecretRefs = {
  [projectId: number]: number;
};

type ProjectStore = {
  projectId: number | null;
  setProjectId: (id: number | null) => void;
  project: ProjectWithRole | null;
  setProject: (project: ProjectWithRole | null) => void;
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
  loadingStates: boolean[];
  setLoadingStates: (states: boolean[]) => void;
  isLoading: boolean;
  isDeletingProject: boolean;
  setIsDeletingProject: (isDeletingProject: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  showAll: boolean;
  setShowAll: (showAll: boolean) => void;
  deleteProject: () => void;
  clear: () => void;
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
      isLoading: true,
      isDeletingProject: false,
      error: null,
      showAll: false,
      clear: () =>
        set({
          projectId: null,
          project: null,
          secret: null,
          secretId: null,
        }),
      setProjectId: (projectId: number | null) => set({ projectId }),
      setSecret: (secret: EnvironmentSecret | null) => set({ secret }),
      setProject: (project: ProjectWithRole | null) => set({ project }),
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
      loadingStates: [],
      setLoadingStates: (states) =>
        set({ loadingStates: states, isLoading: states.some((s) => s) }),
      deleteProject: () =>
        set({
          projectId: null,
          project: null,
          secret: null,
          secretId: null,
          isDeletingProject: true,
        }),
      setIsDeletingProject: (isDeletingProject: boolean) => set({ isDeletingProject }),
      setError: (error: string | null) => set({ error }),
      setShowAll: (showAll) => set({ showAll }),
    }),
    {
      name: "project-store",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        state?.setIsSaved(true);
        state?.setLoadingStates([true]);
      },
    }
  )
);
