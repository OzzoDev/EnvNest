"use client";

import { useProjectStore } from "@/store/projectStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import AlertDialog from "@/components/utils/AleartDialog";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { GrProjects } from "react-icons/gr";
import { useDashboardContext } from "@/context/DashboardContext";

const ProjectList = () => {
  const { state, isMobile, toggleSidebar } = useSidebar();
  const projectId = useProjectStore((state) => state.projectId);
  const setProjectId = useProjectStore((state) => state.setProjectId);
  const setSecretId = useProjectStore((state) => state.setSecretId);
  const isSaved = useProjectStore((state) => state.isSaved);

  const { projects } = useDashboardContext();

  const selectProject = (projectId: number) => {
    setSecretId(null);
    setProjectId(projectId);
    isMobile && toggleSidebar();
  };

  const hasProjects = !projects || projects.length;

  if (!hasProjects) {
    return null;
  }

  const isCollapsed = state === "collapsed" && !isMobile;

  if (isCollapsed && hasProjects) {
    return (
      <Button onClick={toggleSidebar} variant="ghost">
        <GrProjects size={24} />
      </Button>
    );
  }

  if (!projects) {
    return null;
  }

  return (
    <div>
      <p className="text-lg text-text-color mb-8">Your projects</p>
      <ScrollArea
        className={cn(
          "flex flex-col gap-y-4 max-h-[300px]",
          isCollapsed ? "overflow-y-hidden" : "overflow-y-auto"
        )}>
        {projects?.map((project) => {
          return isSaved ? (
            <div key={project.id} className="my-2 px-1">
              <Button
                onClick={() => selectProject(project.id)}
                variant="ghost"
                className={cn(
                  "justify-start w-full text-left break-all whitespace-normal h-auto border-l-2 border-transparent",
                  {
                    "hover:bg-transparent hover:text-primary underline text-primary":
                      projectId === project.id,
                  }
                )}>
                {project.full_name}
              </Button>
            </div>
          ) : (
            <div key={project.id} className="my-2">
              <AlertDialog
                title="Are you sure you want to change project?"
                description="Any unsaved changes will be lost. This action cannot be undone."
                action="Continue"
                actionFn={() => selectProject(project.id)}>
                <Button
                  key={project.id}
                  onClick={() => selectProject(project.id)}
                  variant="ghost"
                  className={cn(
                    "justify-start w-full text-left break-all whitespace-normal h-auto border-l-2 border-transparent",
                    {
                      "hover:bg-transparent hover:text-primary underline text-primary":
                        projectId === project.id,
                    }
                  )}>
                  {project.full_name}
                </Button>
              </AlertDialog>
            </div>
          );
        })}
      </ScrollArea>
    </div>
  );
};

export default ProjectList;
