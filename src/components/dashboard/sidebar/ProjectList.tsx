"use client";

import { trpc } from "@/trpc/client";
import { useEffect } from "react";
import { useProjectStore } from "@/store/projectStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import AlertDialog from "@/components/utils/AleartDialog";
import { cn } from "@/lib/utils";
import SkeletonWrapper from "@/components/utils/loaders/SkeletonWrapper";
import { useSidebar } from "@/components/ui/sidebar";
import { GrProjects } from "react-icons/gr";
import { useSidebarStore } from "@/store/sidebarStore";
import { useVirtualQuery } from "@/hooks/use-virtual-query";
import { ProjectTable } from "@/types/types";

const ProjectList = () => {
  const { state, isMobile, toggleSidebar } = useSidebar();
  const projectId = useProjectStore((state) => state.projectId);
  const project = useProjectStore((state) => state.project);

  const setProjectId = useProjectStore((state) => state.setProjectId);
  const setProject = useProjectStore((state) => state.setProject);
  const setSecretId = useProjectStore((state) => state.setSecretId);
  const setSecret = useProjectStore((state) => state.setSecret);
  const isSaved = useProjectStore((state) => state.isSaved);
  const isDeletingProject = useProjectStore((state) => state.isDeletingProject);
  const setIsDeletingProject = useProjectStore((state) => state.setIsDeletingProject);

  const setLoadingStates = useSidebarStore((state) => state.setLoadingStates);
  const isLoadingSidebar = useSidebarStore((state) => state.isLoading);
  const isLoadingDashboard = useProjectStore((state) => state.isLoading);

  const {
    data: projects,
    isLoading: isLoadingProjetcs,
    refetch: refetchProjects,
  } = useVirtualQuery<ProjectTable[]>(
    () => trpc.project.get.useQuery(undefined, { retry: false }),
    [projectId, project],
    "projects"
  );

  useEffect(() => {
    setLoadingStates([isLoadingProjetcs]);
  }, [isLoadingProjetcs]);

  useEffect(() => {
    if (projects) {
      setIsDeletingProject(false);

      const isNotValidProjectId = !projects.some((pro) => pro.id === projectId);

      if (isNotValidProjectId) {
        setProjectId(null);
        setProject(null);
        setSecretId(null);
        setSecret(null);
      }
    }
  }, [projects]);

  useEffect(() => {
    refetchProjects();
  }, [projectId]);

  const selectProject = (projectId: number) => {
    setSecretId(null);
    setProjectId(projectId);
    isMobile && toggleSidebar();
  };

  if (projects?.length === 0) {
    return <p className="text-lg text-text-color mb-8">No projects created</p>;
  }

  const isCollapsed = state === "collapsed" && !isMobile;

  if (isCollapsed) {
    return (
      <Button onClick={toggleSidebar} variant="ghost">
        <GrProjects size={24} />
      </Button>
    );
  }

  const isLoadingUi =
    isLoadingProjetcs || isLoadingSidebar || isLoadingDashboard || isDeletingProject;

  return (
    <SkeletonWrapper skeletons={8} isLoading={isLoadingUi} className="flex flex-col gap-y-4">
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
    </SkeletonWrapper>
  );
};

export default ProjectList;
