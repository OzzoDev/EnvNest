"use client";

import { trpc } from "@/trpc/client";
import { Button } from "./ui/button";
import { useEffect } from "react";
import { useProjectStore } from "@/store/projectStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ProjectList = () => {
  const { data: projects, refetch, isLoading } = trpc.project.getAllProjects.useQuery();
  const projectId = useProjectStore((state) => state.projectId);
  const setProjectId = useProjectStore((state) => state.setProjectId);

  useEffect(() => {
    refetch();
  }, [projectId]);

  const selectProject = (projectId: string) => {
    setProjectId(projectId);
  };

  if (isLoading) {
    return <p className="text-gray-500">Loading projects...</p>;
  }

  return (
    <div>
      <p className="text-lg text-text-color mb-8">Your projects</p>
      <ul className="flex flex-col gap-y-4">
        {projects?.map((project) => (
          <AlertDialog key={project.id}>
            <AlertDialogTrigger asChild>
              <Button
                key={project.id}
                variant={project.id.toString() == projectId ? "secondary" : "ghost"}
                className="justify-start">
                {project.full_name}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to change project?</AlertDialogTitle>
                <AlertDialogDescription>
                  Any unsaved changes will be lost. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => selectProject(project.id.toString())}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ))}
      </ul>
    </div>
  );
};

export default ProjectList;
