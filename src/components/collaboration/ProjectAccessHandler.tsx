"use client";

import { trpc } from "@/trpc/client";
import ProjectAccess from "./ProjectAccess";
import SkeletonWrapper from "../utils/loaders/SkeletonWrapper";

const ProjectAccessHandler = () => {
  const {
    data: projects,
    isLoading: isLoadingProjects,
    refetch: refetchProjects,
  } = trpc.collaborator.get.useQuery(undefined, { retry: false });

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
