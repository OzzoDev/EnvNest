"use client";

import { ReactNode } from "react";
import TrpcProvider from "./TrpcProvider";
import { ProjectControllerProvider } from "./ProjectControllerProvider";
import { SidebarControllerProvider } from "./SidebarControllerProvider";

const Providers = ({ children }: { children: ReactNode }) => {
  return <TrpcProvider>{children}</TrpcProvider>;
};

export default Providers;
