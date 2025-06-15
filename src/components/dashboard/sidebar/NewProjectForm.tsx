"use client";

import { FormEvent, useEffect, useState } from "react";
import { trpc } from "@/trpc/client";
import React from "react";
import { toast } from "sonner";
import { useProjectStore } from "@/store/projectStore";
import ModeSelect from "@/components/utils/ModeSelect";
import { Button } from "@/components/ui/button";
import AlertDialog from "@/components/utils/AleartDialog";
import SkeletonWrapper from "@/components/utils/loaders/SkeletonWrapper";
import { useSidebar } from "@/components/ui/sidebar";
import { GoPlus } from "react-icons/go";
import { useSidebarStore } from "@/store/sidebarStore";
import { useVirtualQuery } from "@/hooks/use-virtual-query";
import { GithubRepo } from "@/types/types";

const NewProjectForm = () => {
  const { state, isMobile, toggleSidebar } = useSidebar();
  const [repo, setRepo] = useState<string | null>(null);
  const projectId = useProjectStore((state) => state.projectId);
  const setProjectId = useProjectStore((state) => state.setProjectId);
  const setSecretId = useProjectStore((state) => state.setSecretId);
  const setSecret = useProjectStore((state) => state.setSecret);
  const setIsSaved = useProjectStore((state) => state.setIsSaved);
  const isSaved = useProjectStore((state) => state.isSaved);
  const setLoadingStates = useSidebarStore((state) => state.setLoadingStates);
  const isLoadingSidebar = useSidebarStore((state) => state.isLoading);

  const {
    data: repos = [],
    isLoading: isLoadingRepos,
    refetch: refetchRepos,
  } = useVirtualQuery<GithubRepo[]>(
    () => trpc.github.getAvailableRepos.useQuery(undefined, { retry: false }),
    [],
    "repos"
  );

  const { mutate: createProject, isPending: isCreatingProject } = trpc.project.create.useMutation({
    onError: () => {
      toast.error("Error creating new project");
    },
    onSuccess: (data) => {
      setRepo(null);
      setProjectId(data.id);
      setSecretId(null);
      setSecret(null);
      setIsSaved(true);
      refetchRepos();
      isMobile && toggleSidebar();
      toast.success(`Project ${data.full_name} created successfully`);
    },
  });

  useEffect(() => {
    refetchRepos();
  }, [projectId]);

  useEffect(() => {
    setLoadingStates([isLoadingRepos, isCreatingProject]);
  }, [isLoadingRepos, isCreatingProject]);

  const onSubmit = (e?: FormEvent | React.MouseEvent) => {
    e?.preventDefault();

    if (!repo) {
      return;
    }

    const repoData = repos.find((rep) => rep.full_name === repo);

    if (!repoData) {
      return;
    }

    createProject({
      repo_id: repoData.id,
      name: repoData.name,
      full_name: repoData.full_name,
      owner: repoData.owner.login!,
      url: repoData.html_url,
    });
  };

  if (state === "collapsed" && !isMobile) {
    return (
      <Button onClick={toggleSidebar} variant="ghost">
        <GoPlus size={28} />
      </Button>
    );
  }

  const isLoadingUI = isLoadingRepos || isLoadingSidebar;

  return (
    <SkeletonWrapper skeletons={2} isLoading={isLoadingUI} className="flex flex-col gap-y-4">
      <form onSubmit={onSubmit} className="flex flex-col gap-y-4 w-fit">
        <p className="text-lg text-text-color">Create a new project</p>
        <ModeSelect
          searchPlaceholder="Search repositories..."
          emptyPlaceHolder="No repository found"
          selectPlaceholder="Select a repository"
          enableSearch={true}
          value={repo}
          options={repos.map((rep) => rep.full_name)}
          onSelect={(rep) => setRepo(rep)}
        />
        {repo &&
          (isSaved ? (
            <Button type="submit" variant="secondary">
              Create
            </Button>
          ) : (
            <AlertDialog
              title="Create new project with unsaved changes?"
              description="You current project is unsaved. Any unsaved changes will be lost. This action cannot be undone. Are you sure you want to continue?"
              action="Continue"
              actionFn={() => onSubmit()}>
              <Button variant="secondary">Create</Button>
            </AlertDialog>
          ))}
      </form>
    </SkeletonWrapper>
  );
};

export default NewProjectForm;
