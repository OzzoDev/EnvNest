"use client";

import { GithubRepo } from "@/types/types";
import { FormEvent, useEffect, useState } from "react";
import { trpc } from "@/trpc/client";
import React from "react";
import { toast } from "sonner";
import { useProjectStore } from "@/store/projectStore";
import ModeSelect from "@/components/utils/ModeSelect";
import { Button } from "@/components/ui/button";
import AlertDialog from "@/components/utils/AleartDialog";
import SkeletonWrapper from "@/components/utils/loaders/SkeletonWrapper";

const NewProjectForm = () => {
  const [repo, setRepo] = useState<string | null>(null);
  const [filteredRepos, setFilteredRepos] = useState<string[]>([]);
  const setProjectId = useProjectStore((state) => state.setProjectId);
  const setIsSaved = useProjectStore((state) => state.setIsSaved);
  const isSaved = useProjectStore((state) => state.isSaved);

  const { data: repos = [], isLoading: isLoadingRepos } = trpc.github.getRepos.useQuery();

  const {
    refetch,
    data: existingRepos,
    isLoading: isLoadingExistingRepos,
  } = trpc.project.getAll.useQuery(undefined, {
    enabled: !!(repos && repos?.length > 0),
  });

  useEffect(() => {
    setFilteredRepos(
      repos
        .filter((repo) => !existingRepos?.some((pro) => pro.repo_id === repo.id))
        .map((repo) => repo.full_name)
    );
  }, [existingRepos]);

  const { mutate } = trpc.project.create.useMutation({
    onError: () => {
      toast.error("Error creating new project");
    },
    onSuccess: (data) => {
      setRepo(null);
      setProjectId(data.id);
      setIsSaved(true);
      refetch();
      toast.success(`Project ${data.full_name} created successfully`);
    },
  });

  const onSubmit = (e?: FormEvent | React.MouseEvent) => {
    e?.preventDefault();

    if (!repo) {
      return;
    }

    const repoData = repos
      .filter((repo) => !existingRepos?.some((pro) => pro.repo_id === repo.id))
      .find((rep) => rep.full_name === repo);

    if (!repoData) {
      return;
    }

    mutate({
      repo_id: repoData.id,
      name: repoData.name,
      full_name: repoData.full_name,
      owner: repoData.owner.login!,
      url: repoData.html_url,
    });
  };

  return (
    <SkeletonWrapper
      skeletons={2}
      isLoading={isLoadingRepos || isLoadingExistingRepos}
      className="flex flex-col gap-y-4">
      <form onSubmit={onSubmit} className="flex flex-col gap-y-4 w-fit">
        <p className="text-lg text-text-color">Create a new project</p>
        <ModeSelect
          searchPlaceholder="Search repositories..."
          emptyPlaceHolder="No repository found"
          selectPlaceholder="Select a repository"
          enableSearch={true}
          isRequired={false}
          value={repo}
          options={filteredRepos}
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
