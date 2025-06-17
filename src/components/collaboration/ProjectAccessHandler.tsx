"use client";

import { trpc } from "@/trpc/client";
import ProjectAccess from "./ProjectAccess";
import SkeletonWrapper from "../utils/loaders/SkeletonWrapper";

const ProjectAccessHandler = () => {
  const {
    data: projects,
    isLoading: isLoadingProjects,
    error: projectsError,
    refetch: refetchProjects,
  } = trpc.collaborator.get.useQuery(undefined, { retry: false });

  if (projectsError) {
    return <p className="text-destructive">Error loading projects</p>;
  }

  if (projects?.length === 0) {
    return (
      <p className="text-muted-foreground">
        No projects available. Only public Github repositories will be visible
      </p>
    );
  }

  return (
    <SkeletonWrapper skeletons={5} isLoading={isLoadingProjects} className="flex flex-col gap-y-8">
      <ul className="flex flex-col gap-y-8">
        {projects?.map((project) => (
          <ProjectAccess
            key={project.full_name}
            project={project}
            refetchProjects={refetchProjects}
          />
        ))}
      </ul>
    </SkeletonWrapper>
  );
};

export default ProjectAccessHandler;
