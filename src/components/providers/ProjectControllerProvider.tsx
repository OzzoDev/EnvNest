"use client";

import { ProjectControllerContext } from "@/context/ProjectControllerContext";
import { useProjectController } from "@/hooks/use-project-controller";
import { ReactNode } from "react";

export const ProjectControllerProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const controller = useProjectController();

  return (
    <ProjectControllerContext.Provider value={controller}>
      {children}
    </ProjectControllerContext.Provider>
  );
};
