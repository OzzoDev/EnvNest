"use client";

import { Loader2 } from "lucide-react";
import { ReactNode } from "react";
import Sidebar from "./sidebar/Sidebar";
import { useDashboardContext } from "@/context/DashboardContext";

const Dashboard = ({ children }: { children: ReactNode }) => {
  const { isLoading } = useDashboardContext();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen relative w-full">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pb-20">
          <Loader2 className="animate-spin h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="flex flex-col gap-y-12 p-6 min-h-screen w-full max-w-screen overflow-x-hidden">
        {children}
      </div>
    </>
  );
};

export default Dashboard;
