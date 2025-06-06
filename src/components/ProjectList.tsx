"use client";

import { trpc } from "@/trpc/client";
import { Button } from "./ui/button";
import { useEffect } from "react";
import { useProjectStore } from "@/store/projectStore";
import AlertDialog from "./utils/AleartDialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { ScrollArea } from "./ui/scroll-area";

const ProjectList = () => {
  const { data: projects, error, isLoading, refetch } = trpc.project.getAll.useQuery();
  const projectId = useProjectStore((state) => state.projectId);
  const setProjectId = useProjectStore((state) => state.setProjectId);
  const isSaved = useProjectStore((state) => state.isSaved);
  const setIsSaved = useProjectStore((state) => state.setIsSaved);

  useEffect(() => {
    refetch();
  }, [projectId]);

  const selectProject = (projectId: number) => {
    setProjectId(projectId);
    setIsSaved(true);
  };

  if (isLoading) {
    return <p className="text-text-color">Loading projects...</p>;
  }

  if (error) {
    return <p className="text-destructive">Error loading projects</p>;
  }

  if (projects?.length === 0) {
    return <p className="text-lg text-text-color mb-8">No projects created</p>;
  }

  return (
    <div>
      <p className="text-lg text-text-color mb-8">Your projects</p>
      <ScrollArea className="flex flex-col gap-y-4 max-h-[500px] overflow-y-auto">
        {projects?.map((project) => {
          return isSaved ? (
            <div key={project.id} className="my-2">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button
                    onClick={() => selectProject(project.id)}
                    variant={project.id == projectId ? "secondary" : "ghost"}
                    className="justify-start w-[240px] text-left">
                    <span className="truncate overflow-hidden whitespace-nowrap block w-full">
                      {project.full_name}
                    </span>
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="min-w-[240px] w-full py-2">
                  {project.full_name}
                </HoverCardContent>
              </HoverCard>
            </div>
          ) : (
            <div key={project.id} className="my-2">
              <AlertDialog
                title="Are you sure you want to change project?"
                description="Any unsaved changes will be lost. This action cannot be undone."
                action="Continue"
                actionFn={() => selectProject(project.id)}>
                <Button
                  variant={project.id == projectId ? "secondary" : "ghost"}
                  className="justify-start w-[240px] text-left">
                  <span className="truncate overflow-hidden whitespace-nowrap block w-full">
                    {project.full_name}
                  </span>
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
