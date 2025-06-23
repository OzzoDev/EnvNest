"use client";

import { ENVIRONMENTS } from "@/config";
import { FormEvent } from "react";
import { Button } from "../ui/button";
import ModeSelect from "../utils/ModeSelect";
import { toast } from "sonner";
import { useProjectStore } from "@/store/projectStore";
import { useDashboardContext } from "@/context/DashboardContext";

export type FormData = {
  environment?: string | null;
  path?: string | null;
  template?: string | null;
};

const EnvCreator = () => {
  const { project } = useProjectStore();
  const { templates, environments, paths, createSecret, createEnvFormData, setCreateEnvFormData } =
    useDashboardContext();

  const handleSumbit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isComplete = createEnvFormData.environment && createEnvFormData.path;

    if (!project) {
      return;
    }

    if (!isComplete) {
      if (!createEnvFormData.environment) {
        toast.error("Please select environment");
      } else {
        toast.error("Please select path");
      }

      return;
    }

    const environmentValue = ENVIRONMENTS.find(
      (env) => env.label === createEnvFormData.environment
    )?.value;
    const templateId = templates?.find((temp) => temp.name === createEnvFormData.template)?.id;

    createSecret({
      projectId: project.id,
      environment: environmentValue!,
      path: createEnvFormData.path!,
      templateId,
    });
  };

  const isValid = createEnvFormData?.environment && createEnvFormData.path;

  return (
    <form onSubmit={handleSumbit} className="flex flex-col gap-y-4">
      <p className="font-medium text-text-color">Create .env file</p>
      <div className="flex flex-col xl:flex-row items-start  gap-x-8 gap-y-4">
        <ModeSelect
          selectPlaceholder="Select environment"
          emptyPlaceHolder="No environments found"
          selectLabel="Environments"
          options={
            environments
              ?.map((env) => env?.label)
              .filter((label): label is string => Boolean(label)) || []
          }
          value={createEnvFormData.environment ?? null}
          onSelect={(value) => setCreateEnvFormData((prev) => ({ ...prev, environment: value }))}
        />
        {createEnvFormData.environment && (
          <ModeSelect
            selectPlaceholder="Select path"
            emptyPlaceHolder="No paths found"
            enableSearch={true}
            options={paths ?? []}
            value={createEnvFormData.path ?? null}
            onSelect={(value) => setCreateEnvFormData((prev) => ({ ...prev, path: value }))}
          />
        )}
        {createEnvFormData.path && (
          <ModeSelect
            selectPlaceholder="Select template"
            emptyPlaceHolder="No template found"
            selectLabel="Templates"
            options={templates?.map((template) => template.name) ?? []}
            value={createEnvFormData.template ?? null}
            onSelect={(value) => setCreateEnvFormData((prev) => ({ ...prev, template: value }))}
          />
        )}
        {isValid && (
          <Button type="submit" variant="secondary" className="w-fit">
            Create
          </Button>
        )}
      </div>
    </form>
  );
};

export default EnvCreator;
