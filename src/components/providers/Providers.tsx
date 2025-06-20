"use client";

import { ReactNode } from "react";
import TrpcProvider from "./TrpcProvider";
import { ProjectControllerProvider } from "./ProjectControllerProvider";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <TrpcProvider>
      <ProjectControllerProvider>{children}</ProjectControllerProvider>
    </TrpcProvider>
  );
};

export default Providers;
