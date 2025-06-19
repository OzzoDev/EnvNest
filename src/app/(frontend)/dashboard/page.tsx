"use client";

import EnvCreator from "@/components/editor/EnvCreator";
import EnvEditor from "@/components/editor/EnvEditor";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/store/projectStore";
import { useSidebarStore } from "@/store/sidebarStore";
import { MdErrorOutline } from "react-icons/md";

const DashboardPage = () => {
  const error = useProjectStore((state) => state.error);
  const project = useProjectStore((state) => state.project);
  const hasProjects = useProjectStore((state) => state.hasProjects);
  const isLoadingDashboard = useProjectStore((state) => state.isLoading);
  const isLoadingSidebar = useSidebarStore((state) => state.isLoading);

  const setSideBarOpen = useSidebarStore((state) => state.setSidebarOpen);

  if (error) {
    return (
      <div className="pt-44 flex flex-col gap-y-16 items-center">
        <MdErrorOutline size={48} className="text-destructive" />
        <p className="text-center text-2xl text-destructive font-medium">{error}</p>
        <Button onClick={() => window.location.reload()}>Try again</Button>
      </div>
    );
  }

  if (!hasProjects && !isLoadingDashboard && !isLoadingSidebar) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-32 md:16">
        <h2 className="text-2xl text-text-color text-center font-medium w-[90%]">
          Looks like you don’t have any projects yet. Create one to start managing your env files.
        </h2>
        <Button onClick={() => setSideBarOpen(true)}>New Project</Button>
      </div>
    );
  }

  const hasWriteAccess = project?.role === "admin" || project?.role === "editor";

  return (
    <>
      {hasWriteAccess && <EnvCreator />}
      <EnvEditor />
    </>
  );
};

export default DashboardPage;
