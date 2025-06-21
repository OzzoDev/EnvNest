"use client";

import { SidebarControllerType } from "@/hooks/use-sidebar-controller";
import { createContext, useContext } from "react";

export const SidebarControllerContext =
  createContext<SidebarControllerType | null>(null);

export const useSidebarControllerContext = () => {
  const ctx = useContext(SidebarControllerContext);

  if (!ctx) {
    throw new Error("SidebarControllerContext not found");
  }

  return ctx;
};
