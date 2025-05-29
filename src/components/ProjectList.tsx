"use client";

import { trpc } from "@/trpc/client";
import { Button } from "./ui/button";
import { useEffect } from "react";
import { useProjectStore } from "@/store/projectStore";
import AlertDialog from "./utils/AleartDialog";

const ProjectList = () => {
  const { data: projects, error, isLoading, refetch } = trpc.project.getAllProjects.useQuery();
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

  console.log("projectDI: ", projectId);

  return (
    <div>
      <p className="text-lg text-text-color mb-8">Your projects</p>
      <ul className="flex flex-col gap-y-4">
        {projects?.map((project) => {
          return isSaved ? (
            <Button
              key={project.id}
              onClick={() => selectProject(project.id)}
              variant={project.id == projectId ? "secondary" : "ghost"}
              className="justify-start">
              {project.full_name}
            </Button>
          ) : (
            <AlertDialog
              title="Are you sure you want to change project?"
              description="Any unsaved changes will be lost. This action cannot be undone."
              action="Continue"
              actionFn={() => selectProject(project.id)}>
              <Button
                key={project.id}
                variant={project.id == projectId ? "secondary" : "ghost"}
                className="justify-start">
                {project.full_name}
              </Button>
            </AlertDialog>
          );
        })}
      </ul>
    </div>
  );
};

export default ProjectList;
