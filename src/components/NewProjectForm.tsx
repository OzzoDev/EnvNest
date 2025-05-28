"use client";

import { GithubRepo } from "@/types/types";
import Combobox from "./utils/Combobox";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { trpc } from "@/trpc/client";
import React from "react";
import { toast } from "sonner";
import { useProjectStore } from "@/store/projectStore";

type NewProjectFormProps = {
  repos: GithubRepo[];
};

const NewProjectForm = ({ repos }: NewProjectFormProps) => {
  const [repo, setRepo] = useState<GithubRepo | null>(null);
  const [filteredRepos, setFilteredRepos] = useState<GithubRepo[]>([]);
  const setProjectId = useProjectStore((state) => state.setProjectId);

  const { refetch, data: existingRepos } = trpc.project.getAllProjects.useQuery();

  useEffect(() => {
    setFilteredRepos(
      repos.filter((repo) => !existingRepos?.some((pro) => pro.repo_id === repo.id))
    );
  }, [existingRepos]);

  const { mutate } = trpc.project.createProject.useMutation({
    onError: (err) => {
      console.log("err:", err);
      toast.error("Error creating new project");
    },
    onSuccess: (data) => {
      setRepo(null);
      setProjectId(data.id.toString());
      refetch();
      toast.success(`Project ${data.full_name} creatd successfully`);
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

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-y-4">
      <p className="text-lg text-text-color">Create a new project</p>
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
      {repo && (
        <Button type="submit" variant="secondary">
          Create
        </Button>
      )}
    </form>
  );
};

export default NewProjectForm;
