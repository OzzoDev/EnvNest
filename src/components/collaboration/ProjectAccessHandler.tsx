"use client";

import ProjectAccess from "./ProjectAccess";
import { useOrgContext } from "@/context/OrgContext";

const ProjectAccessHandler = () => {
  const { projects, refetchProjects } = useOrgContext();

  if (projects?.length === 0) {
    return (
      <p className="text-muted-foreground">
        You don’t have admin access to any projects. Only public GitHub repositories will be shown.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-y-8">
      {projects?.map((project) => (
        <ProjectAccess
          key={project?.full_name}
          project={project!}
          refetchProjects={refetchProjects}
        />
      ))}
    </ul>
  );
};

export default ProjectAccessHandler;
