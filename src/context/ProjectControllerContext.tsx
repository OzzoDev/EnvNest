"use client";

import { ProjectControllerType } from "@/hooks/use-project-controller";
import { createContext, useContext } from "react";

export const ProjectControllerContext = createContext<ProjectControllerType | null>(null);

export const useProjectControllerContext = () => {
  const ctx = useContext(ProjectControllerContext);

  if (!ctx) {
    throw new Error("ProjectControllerContext not found");
  }

  return ctx;
};
