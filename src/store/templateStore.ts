import { TemplateTable } from "@/types/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type TemplateStore = {
  template: TemplateTable | null;
  setTemplate: (template: TemplateTable | null) => void;
  isSaved: boolean;
  setIsSaved: (isSaved: boolean) => void;
};

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set) => ({
      template: null,
      isSaved: true,
      setTemplate: (template: TemplateTable | null) => set({ template }),
      setIsSaved: (isSaved: boolean) => set({ isSaved }),
    }),
    {
      name: "template-store",
    }
  )
);
