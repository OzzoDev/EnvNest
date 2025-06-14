import { TemplateTable } from "@/types/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type TemplateStore = {
  template: TemplateTable | null | undefined;
  setTemplate: (template: TemplateTable | null | undefined) => void;
  isSaved: boolean;
  setIsSaved: (isSaved: boolean) => void;
};

export const useTemplateStore = create<TemplateStore>()(
  persist<TemplateStore>(
    (set): TemplateStore => ({
      template: null,
      isSaved: true,
      setTemplate: (template) => set({ template }),
      setIsSaved: (isSaved) => set({ isSaved }),
    }),
    { name: "template-store" }
  )
);
