"use client";

import { OrgControllerType } from "@/hooks/use-collaboration-controller";
import { createContext, useContext } from "react";

export const OrgContext = createContext<OrgControllerType | null>(null);

export const useOrgContext = () => {
  const ctx = useContext(OrgContext);

  if (!ctx) {
    throw new Error("Org context not found");
  }

  return ctx;
};
