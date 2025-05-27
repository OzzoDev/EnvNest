"use client";

import { GithubRepo } from "@/types/types";
import Combobox from "./utils/Combobox";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { trpc } from "@/trpc/client";
import React from "react";

type NewProjectFormProps = {
  repos: GithubRepo[];
};

const NewProjectForm = ({ repos }: NewProjectFormProps) => {
  const [repo, setRepo] = useState<GithubRepo | null>(null);
  const [filteredRepos, setFilteredRepos] = useState<GithubRepo[]>([]);

  const {
    data: existingRepos,
    isLoading: isLoadingExistingRepos,
    refetch,
  } = trpc.project.getAllProjects.useQuery();

  useEffect(() => {
    setFilteredRepos(
      repos.filter((repo) => !existingRepos?.some((pro) => pro.repo_id === repo.id))
    );
  }, [existingRepos]);

  const { mutate } = trpc.project.createProject.useMutation({
    onError: (err) => {
      console.log("err:", err);
    },
    onSuccess: (data) => {
      setRepo(null);
      refetch();
      console.log("Data:", data);
    },
  });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!repo) {
      return;
    }

    mutate({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      owner: repo.owner.login!,
      url: repo.html_url,
    });
  };

  if (isLoadingExistingRepos) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-gray-500">Loading projects...</span>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-x-6 p-6">
      <Combobox<GithubRepo, "full_name", "full_name", "id">
        data={filteredRepos}
        value={repo}
        labelKey="full_name"
        valueKey="full_name"
        mapKey="id"
        searchMessage="Search repositories..."
        selectMessage="Select a repository"
        emptyMessage="No repository found"
        setValue={setRepo}
      />
      <Button type="submit" variant="secondary">
        Create
      </Button>
    </form>
  );
};

export default NewProjectForm;
