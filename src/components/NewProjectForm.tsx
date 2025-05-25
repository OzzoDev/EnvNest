"use client";

import { GithubRepo } from "@/types/types";
import Combobox from "./utils/Combobox";
import { FormEvent, useState } from "react";
import { Button } from "./ui/button";

type NewProjectFormProps = {
  repos: GithubRepo[];
};

const NewProjectForm = ({ repos }: NewProjectFormProps) => {
  const [projectName, setProject] = useState<string>("");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    //generate encryption key

    //add project to db
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-x-6 p-6">
      <Combobox<GithubRepo, "full_name", "full_name", "id">
        data={repos}
        value={projectName}
        labelKey="full_name"
        valueKey="full_name"
        mapKey="id"
        searchMessage="Search repositories..."
        selectMessage="Select a repository"
        emptyMessage="No repository found"
        setValue={setProject}
      />
      <Button type="submit" variant="secondary">
        Create
      </Button>
    </form>
  );
};

export default NewProjectForm;
