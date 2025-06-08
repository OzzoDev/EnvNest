"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import AlertDialog from "@/components/utils/AleartDialog";
import { convertToLocalTime } from "@/lib/utils";
import { useProjectStore } from "@/store/projectStore";
import { trpc } from "@/trpc/client";
import { Github, User } from "lucide-react";
import Link from "next/link";

const DashboardHeader = () => {
  const project = useProjectStore((state) => state.project);
  const projectId = useProjectStore((state) => state.projectId);
  const clearStore = useProjectStore((state) => state.clearStore);

  const { mutate: deleteProject } = trpc.project.delete.useMutation({
    onSuccess: () => {
      clearStore();
    },
  });

  if (!project) {
    return null;
  }

  const [date, time] = convertToLocalTime(project.created_at).split(" ");

  return (
    <div className="flex justify-between">
      <div>
        <p className="text-2xl text-primary font-semibold">{project.name}</p>
        <span className="mt-4 flex gap-x-1 text-text-color">
          <User aria-hidden="true" /> {project.owner}
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
          <AlertDialog
            title="Delete project"
            description={`Are you sure you want to delete ${project.full_name}. This action can't be undone`}
            action="Delete"
            actionFn={() => deleteProject({ projectId: Number(projectId) })}>
            <Button variant="secondary">Delete</Button>
          </AlertDialog>
        </div>
        <div className="flex flex-col items-end text-text-color text-sm">
          <p className="text-base font-medium">Project created</p>
          <p>
            {date} / {time}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
