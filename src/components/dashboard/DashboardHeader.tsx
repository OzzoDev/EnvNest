"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import AlertDialog from "@/components/utils/AleartDialog";
import { cn, convertToLocalTime } from "@/lib/utils";
import { useProjectStore } from "@/store/projectStore";
import { trpc } from "@/trpc/client";
import { Github, User } from "lucide-react";
import Link from "next/link";
import SkeletonWrapper from "../utils/loaders/SkeletonWrapper";
import { toast } from "sonner";

const DashboardHeader = () => {
  const project = useProjectStore((state) => state.project);
  const projectId = useProjectStore((state) => state.projectId);
  const isLoading = useProjectStore((state) => state.isLoading);
  const isDeletingProject = useProjectStore((state) => state.isDeletingProject);
  const deleteProject = useProjectStore((state) => state.deleteProject);
  const deleteProjectSecretRef = useProjectStore((state) => state.deleteProjectSecretRef);

  const { mutate } = trpc.project.delete.useMutation({
    onError: (err) => {
      toast.error(err.message || "Something went wrong. Please try again");
    },
    onSuccess: () => {
      if (typeof projectId === "number") {
        deleteProjectSecretRef(projectId);
      }
      deleteProject();
    },
  });

  const [date, time] = convertToLocalTime(project?.created_at ?? "").split(" ");

  const isLoadingUi = isLoading || isDeletingProject;

  const hasWriteAccess = project?.role === "admin" || project?.role === "editor";

  if (!projectId) {
    return null;
  }

  return (
    <>
      <div className="flex lg:hidden flex-col items-start gap-y-4">
        <SkeletonWrapper
          skeletons={3}
          isLoading={isLoadingUi}
          width="w-36"
          height="h-6"
          className="flex flex-col gap-y-4">
          <div>
            <p className="text-2xl text-primary font-semibold">{project?.name}</p>
            <span className="mt-2 flex gap-x-1 text-text-color">
              <User aria-hidden="true" /> {project?.owner}
            </span>
            <p className="mt-1 text-sm text-text-color lg:hidden">
              {date} / {time}
            </p>
          </div>
        </SkeletonWrapper>
        <div className="flex flex-col items-end gap-y-4">
          <SkeletonWrapper
            skeletons={2}
            isLoading={isLoadingUi}
            width="w-20"
            height="h-8"
            className="flex justify-center items-center gap-x-4">
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
                  actionFn={() => mutate({ projectId: Number(projectId) })}>
                  <Button variant="secondary">Delete</Button>
                </AlertDialog>
              )}
            </div>
          </SkeletonWrapper>
        </div>
      </div>

      <div className="hidden lg:flex justify-between">
        <SkeletonWrapper
          skeletons={2}
          isLoading={isLoadingUi}
          width="w-36"
          className="flex flex-col gap-y-4">
          <div>
            <p className="text-2xl text-primary font-semibold">{project?.name}</p>
            <span className="mt-2 lg:mt-4 flex gap-x-1 text-text-color">
              <User aria-hidden="true" /> {project?.owner}
            </span>
            <p className="mt-1 text-sm text-text-color lg:hidden">
              {date} / {time}
            </p>
          </div>
        </SkeletonWrapper>
        <div className="flex flex-col items-end gap-y-4">
          <SkeletonWrapper
            skeletons={2}
            isLoading={isLoadingUi}
            width="w-28"
            className="flex justify-center items-center gap-x-4">
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
                    actionFn={() => mutate({ projectId: Number(projectId) })}>
                    <Button variant="secondary">Delete</Button>
                  </AlertDialog>
                </>
              )}
            </div>
          </SkeletonWrapper>
          <SkeletonWrapper skeletons={1} isLoading={isLoadingUi} width="w-[240px]">
            <div className="hidden lg:flex flex-col items-end text-text-color text-sm">
              <p className="text-base font-medium">Project created</p>
              <p>
                {date} / {time}
              </p>
            </div>
          </SkeletonWrapper>
        </div>
      </div>
    </>
  );
};

export default DashboardHeader;
