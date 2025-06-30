"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Sidebar from "@/components/dashboard/sidebar/Sidebar";
import EnvCreator from "@/components/editor/EnvCreator";
import EnvEditor from "@/components/editor/EnvEditor";
import { Button } from "@/components/ui/button";
import { useDashboardContext } from "@/context/DashboardContext";
import { useProjectStore } from "@/store/projectStore";
import { useSidebarStore } from "@/store/sidebarStore";
import { Loader2 } from "lucide-react";
import { MdErrorOutline } from "react-icons/md";

const DashboardPage = () => {
  const { hasProjects, error } = useProjectStore();
  const { hasWriteAccess, isLoading } = useDashboardContext();

  const setSideBarOpen = useSidebarStore((state) => state.setSidebarOpen);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen relative w-full">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pb-20">
          <Loader2 className="animate-spin h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-44 flex flex-col gap-y-16 items-center w-full">
        <MdErrorOutline size={48} className="text-destructive" />
        <p className="text-center text-2xl text-destructive font-medium">
          {error}
        </p>
        <Button onClick={() => window.location.reload()}>Try again</Button>
      </div>
    );
  }

  if (!hasProjects) {
    return (
      <>
        <Sidebar />
        <div className="flex flex-col items-center justify-center h-screen gap-32 md:16 w-full">
          <h2 className="text-2xl text-text-color text-center font-medium w-[90%]">
            Looks like you don’t have any projects yet. Create one to start
            managing your env files.
          </h2>
          <Button onClick={() => setSideBarOpen(true)}>New Project</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="flex flex-col gap-y-12 p-6 min-h-screen w-full max-w-screen overflow-x-hidden">
        <DashboardHeader />
        {hasWriteAccess && <EnvCreator />}
        <EnvEditor />
      </div>
    </>
  );
};

export default DashboardPage;
