import { create } from "zustand";

type ProjectStore = {
  projectId: string | null;
  setProjectId: (id: string) => void;
};

export const useProjectStore = create<ProjectStore>((set) => ({
  projectId: null,
  setProjectId: (id: string) => set({ projectId: id }),
}));
