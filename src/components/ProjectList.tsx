"use client";

import { trpc } from "@/trpc/client";
import { Button } from "./ui/button";
import { useEffect } from "react";
import { useProjectStore } from "@/store/projectStore";

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
          <Button
            key={project.id}
            variant={project.id.toString() == projectId ? "secondary" : "ghost"}
            onClick={() => selectProject(project.id.toString())}
            className="justify-start">
            {project.full_name}
          </Button>
        ))}
      </ul>
    </div>
  );
};

export default ProjectList;
