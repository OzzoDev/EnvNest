"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import AlertDialog from "@/components/utils/AleartDialog";
import { cn, convertToLocalTime } from "@/lib/utils";
import { Github, User } from "lucide-react";
import Link from "next/link";
import { useProjectControllerContext } from "@/context/ProjectControllerContext";

const DashboardHeader = () => {
  const { projectId, project, hasWriteAccess, deleteProject } = useProjectControllerContext();

  const [date, time] = convertToLocalTime(project?.created_at ?? "").split(" ");

  if (!projectId) {
    return null;
  }

  return (
    <>
      <div className="flex lg:hidden flex-col items-start gap-y-4">
        <div>
          <p className="text-2xl text-primary font-semibold">{project?.name}</p>
          <span className="mt-2 flex gap-x-1 text-text-color">
            <User aria-hidden="true" /> {project?.owner}
          </span>
          <p className="mt-1 text-sm text-text-color lg:hidden">
            {date} / {time}
          </p>
        </div>
        <div className="flex flex-col items-end gap-y-4">
          <div className="flex justify-center items-center gap-x-8">
            <Link
              href={project?.url ?? ""}
              className={cn("w-full", buttonVariants({ variant: "outline", textSize: "lg" }))}>
              <Github aria-hidden="true" />
            </Link>
            {hasWriteAccess && (
              <AlertDialog
                title="Delete project"
                description={`Are you sure you want to delete ${project?.full_name}. This action can't be undone`}
                action="Delete"
                actionFn={() => deleteProject({ projectId: Number(projectId) })}>
                <Button variant="secondary">Delete</Button>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex justify-between">
        <div>
          <p className="text-2xl text-primary font-semibold">{project?.name}</p>
          <span className="mt-2 lg:mt-4 flex gap-x-1 text-text-color">
            <User aria-hidden="true" /> {project?.owner}
          </span>
          <p className="mt-1 text-sm text-text-color lg:hidden">
            {date} / {time}
          </p>
        </div>
        <div className="flex flex-col items-end gap-y-4">
          <div className="flex justify-center items-center gap-x-8">
            <Link
              href={project?.url ?? ""}
              className={cn(
                "w-full lg:w-fits",
                buttonVariants({ variant: "outline", textSize: "lg" })
              )}>
              <Github aria-hidden="true" />
            </Link>
            {hasWriteAccess && (
              <>
                <span aria-hidden="true" className="hidden lg:inline w-[2px] h-8 bg-secondary" />
                <AlertDialog
                  title="Delete project"
                  description={`Are you sure you want to delete ${project?.full_name}. This action can't be undone`}
                  action="Delete"
                  actionFn={() => deleteProject({ projectId: Number(projectId) })}>
                  <Button variant="secondary">Delete</Button>
                </AlertDialog>
              </>
            )}
          </div>
          <div className="hidden lg:flex flex-col items-end text-text-color text-sm">
            <p className="text-base font-medium">Project created</p>
            <p>
              {date} / {time}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardHeader;
