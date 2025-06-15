"use client";

import { trpc } from "@/trpc/client";
import AccessHandlerItem from "./AccessHandlerItem";

const AccessHandler = () => {
  const { data: projects } = trpc.collaborator.get.useQuery(undefined, { retry: false });

  console.log("Projects: ", projects);

  return (
    <ul>
      {projects?.flat().map((project) => (
        <AccessHandlerItem key={project.full_name} project={project} />
      ))}
    </ul>
  );
};

export default AccessHandler;
