"use client";

import { GithubRepo, Project } from "@/types/types";
import Combobox from "./utils/Combobox";
import { FormEvent, useState } from "react";
import { Button } from "./ui/button";
import { trpc } from "@/trpc/client";

type NewProjectFormProps = {
  repos: GithubRepo[];
};

const NewProjectForm = ({ repos }: NewProjectFormProps) => {
  const [repo, setRepo] = useState<GithubRepo | null>(null);

  const { mutate } = trpc.project.createProject.useMutation({
    onError: (err) => {
      console.log("err:", err);
    },
    onSuccess: (data) => {
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

    // console.log(key);

    //generate encryption key

    //add project to db
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-x-6 p-6">
      <Combobox<GithubRepo, "full_name", "full_name", "id">
        data={repos}
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
