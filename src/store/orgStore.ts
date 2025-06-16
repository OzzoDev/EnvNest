import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Org } from "@/types/types";

type OrgStore = {
  org: Org | null | undefined;
  setOrg: (org: Org | null | undefined) => void;
  isSaved: boolean;
  setIsSaved: (isSaved: boolean) => void;
};

export const useOrgStore = create<OrgStore>()(
  persist(
    (set, get) => ({
      org: null,
      setOrg: (org) => set({ org, isSaved: org ? true : get().isSaved }),
      isSaved: true,
      setIsSaved: (isSaved) => set({ isSaved }),
    }),
    {
      name: "org-store",
      onRehydrateStorage: () => (state) => {
        state?.setIsSaved(true);
      },
    }
  )
);
