"use client";

import { DashBoardControllerType } from "@/hooks/use-dashboard-controller";
import { createContext, useContext } from "react";

export const DashBoardContext = createContext<DashBoardControllerType | null>(null);

export const useDashboardContext = () => {
  const ctx = useContext(DashBoardContext);

  if (!ctx) {
    throw new Error("Dashboard context not found");
  }

  return ctx;
};
