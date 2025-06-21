"use client";

import { SidebarControllerContext } from "@/context/SidebarControllerContext";
import { useSidebarController } from "@/hooks/use-sidebar-controller";
import { ReactNode } from "react";

export const SidebarControllerProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const controller = useSidebarController();

  return (
    <SidebarControllerContext.Provider value={controller}>
      {children}
    </SidebarControllerContext.Provider>
  );
};
