"use client";

import { DashBoardContext } from "@/context/DashboardContext";
import { useDashboardController } from "@/hooks/use-dashboard-controller";
import { ReactNode } from "react";

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const controller = useDashboardController();

  return <DashBoardContext.Provider value={controller}>{children}</DashBoardContext.Provider>;
};
