"use client";

import { ReactNode } from "react";
import TrpcProvider from "./TrpcProvider";
import { OrgProvider } from "./OrgProvider";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <TrpcProvider>
      <OrgProvider>{children}</OrgProvider>
    </TrpcProvider>
  );
};

export default Providers;
