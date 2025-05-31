"use client";

import { ENVIRONMENTS } from "@/config";
import { FormEvent, useState } from "react";
import { Button } from "../ui/button";
import { trpc } from "@/trpc/client";
import { useProjectStore } from "@/store/projectStore";
import ModeSelect from "../utils/ModeSelect";

type FormData = {
  environment?: string | null;
  path?: string | null;
  template?: string | null;
};

const EnvCreator = () => {
  const [formData, setFormData] = useState<FormData>({});
  const project = useProjectStore((state) => state.project);

  const { data: paths } = trpc.github.getPaths.useQuery(
    { owner: project?.owner!, repo: project?.name! },
    { enabled: !!project }
  );

  const { data: templates } = trpc.template.getPublic.useQuery();

  const isValid = formData?.environment && formData.path;

  const handleSumbit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log(formData);
  };

  return (
    <form onSubmit={handleSumbit}>
      <p className="font-medium text-text-color mb-4">Create .env file</p>
      <div className="flex items-end gap-x-8">
        <ModeSelect
          selectPlaceholder="Select enviornment"
          emptyPlaceHolder="No environments found"
          selectLabel="Environments"
          options={ENVIRONMENTS.map((env) => env.label)}
          onSelect={(value) => setFormData((prev) => ({ ...prev, environment: value }))}
        />
        <ModeSelect
          selectPlaceholder="Select path"
          emptyPlaceHolder="No paths found"
          enableSearch={true}
          options={paths?.map((path) => path.path) ?? []}
          onSelect={(value) => setFormData((prev) => ({ ...prev, path: value }))}
        />
        <ModeSelect
          selectPlaceholder="Select template"
          emptyPlaceHolder="No template found"
          selectLabel="Templates"
          isRequired={false}
          options={templates?.map((template) => template.name) ?? []}
          onSelect={(value) => setFormData((prev) => ({ ...prev, template: value }))}
        />

        {isValid && (
          <Button type="submit" variant="secondary">
            Create
          </Button>
        )}
      </div>
    </form>
  );
};

export default EnvCreator;
