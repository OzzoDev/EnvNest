"use client";

import { trpc } from "@/trpc/client";
import { useEffect } from "react";
import { useProjectStore } from "@/store/projectStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import AlertDialog from "@/components/utils/AleartDialog";
import { cn } from "@/lib/utils";

const ProjectList = () => {
  const projectId = useProjectStore((state) => state.projectId);
  const setProjectId = useProjectStore((state) => state.setProjectId);
  const setSecretId = useProjectStore((state) => state.setSecretId);
  const isSaved = useProjectStore((state) => state.isSaved);

  const { data: projects, error, isLoading, refetch } = trpc.project.getAll.useQuery();

  useEffect(() => {
    refetch();
  }, [projectId]);

  const selectProject = (projectId: number) => {
    setSecretId(null);
    setProjectId(projectId);
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
      <ScrollArea className="pr-4 flex flex-col gap-y-4 max-h-[500px] overflow-y-auto">
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
