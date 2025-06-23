"use client";

import { ReactNode } from "react";
import TrpcProvider from "./TrpcProvider";

const Providers = ({ children }: { children: ReactNode }) => {
  return <TrpcProvider>{children}</TrpcProvider>;
};

export default Providers;
