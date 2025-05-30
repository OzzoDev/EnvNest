"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { convertToLocalTime } from "@/lib/utils";
import { useProjectStore } from "@/store/projectStore";
import { Clock, Github, User } from "lucide-react";
import Link from "next/link";

const DashboardHeader = () => {
  const project = useProjectStore((state) => state.project);

  const convertedCreatedAt = convertToLocalTime(project?.project_created_at!);

  return (
    <div className="flex justify-between">
      <div>
        <p className="text-2xl text-primary font-semibold">{project?.name}</p>
        <span className="mt-4 flex gap-x-1 text-text-color">
          <User aria-hidden="true" /> {project?.owner}
        </span>
      </div>
      <div className="flex flex-col items-end gap-y-4">
        <div className="flex justify-center items-center gap-x-8">
          <Link
            href={project?.url!}
            className={buttonVariants({ variant: "link", textSize: "lg" })}>
            <Github /> Github
          </Link>
          <span aria-hidden="true" className="w-[2px] h-8 bg-secondary" />
          <Button variant="secondary">Delete</Button>
        </div>
        <div className="flex flex-col items-end text-text-color text-sm">
          <p className="text-base font-medium">Project created</p>
          <p>
            {convertedCreatedAt.date} / {convertedCreatedAt.time}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
