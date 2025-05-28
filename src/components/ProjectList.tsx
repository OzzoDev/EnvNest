"use client";

import { trpc } from "@/trpc/client";
import { Button } from "./ui/button";

const ProjectList = () => {
  const { data: projects } = trpc.project.getAllProjects.useQuery();

  console.log(projects);

  return (
    <div>
      <p className="text-lg text-text-color mb-8">Your projects</p>
      <ul className="flex flex-col gap-y-4">
        {projects?.map((project) => (
          <Button key={project.id} variant="ghost" className="justify-start">
            {project.full_name}
          </Button>
        ))}
      </ul>
    </div>
  );
};

export default ProjectList;
