"use client";

import { OrgContext } from "@/context/OrgContext";
import { useOrgController } from "@/hooks/use-collaboration-controller";
import { ReactNode } from "react";

export const OrgProvider = ({ children }: { children: ReactNode }) => {
  const controller = useOrgController();

  return <OrgContext.Provider value={controller}>{children}</OrgContext.Provider>;
};
