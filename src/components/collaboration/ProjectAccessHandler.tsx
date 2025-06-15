"use client";

import { trpc } from "@/trpc/client";
import ProjectAccess from "./ProjectAccess";
import SkeletonWrapper from "../utils/loaders/SkeletonWrapper";

const ProjectAccessHandler = () => {
  const { data: projects, isLoading: isLoadingProjects } = trpc.collaborator.get.useQuery(
    undefined,
    { retry: false }
  );

  console.log("Proejcts: ", projects);

  return (
    <SkeletonWrapper skeletons={5} isLoading={isLoadingProjects} className="flex flex-col gap-y-8">
      <ul className="flex flex-col gap-y-8">
        {projects?.map((project) => (
          <ProjectAccess key={project.full_name} project={project} />
        ))}
      </ul>
    </SkeletonWrapper>
  );
};

export default ProjectAccessHandler;
