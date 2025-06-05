"use client";

import { ENVIRONMENTS } from "@/config";
import { FormEvent, useState } from "react";
import { Button } from "../ui/button";
import { trpc } from "@/trpc/client";
import { useProjectStore } from "@/store/projectStore";
import ModeSelect from "../utils/ModeSelect";
import { toast } from "sonner";

type FormData = {
  environment?: string | null;
  path?: string | null;
  template?: string | null;
};

const EnvCreator = () => {
  const [formData, setFormData] = useState<FormData>({});
  const project = useProjectStore((state) => state.project);
  const projectId = useProjectStore((state) => state.projectId);

  const setSecretId = useProjectStore((state) => state.setSecretId);

  const { data: environments, refetch: refetchEnvironments } =
    trpc.environment.getAvailable.useQuery(
      { owner: project?.owner!, repo: project?.name!, projectId: Number(projectId) },
      { enabled: !!project && !!projectId }
    );

  const { data: paths, refetch: refetchPaths } = trpc.github.getPaths.useQuery(
    {
      owner: project?.owner!,
      repo: project?.name!,
      projectId: Number(projectId),
      environment: ENVIRONMENTS.find((env) => env.label === formData.environment)?.value!,
    },
    { enabled: !!project && !!projectId && !!formData.environment }
  );

  const { data: templates, refetch: refetchTemplates } = trpc.template.getPublic.useQuery();

  const { mutate: createSecret } = trpc.secret.create.useMutation({
    onSuccess: (secretId) => {
      setSecretId(secretId);
      setFormData({});

      refetchTemplates();
      refetchPaths();

      toast.success(`${formData.environment} .env file created successfully`);
    },
    onError: () => {
      toast.success(`Error creating ${formData.environment} .env file`);
    },
  });

  const handleSumbit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isComplete = formData.environment && formData.path;

    if (!project) {
      return;
    }

    if (!isComplete) {
      if (!formData.environment) {
        toast.error("Please select environment");
      } else {
        toast.error("Please select path");
      }

      return;
    }

    const environmentValue = ENVIRONMENTS.find((env) => env.label === formData.environment)?.value;
    const templateId = templates?.find((temp) => temp.name === formData.template)?.id;

    createSecret({
      projectId: project.id,
      environment: environmentValue!,
      path: formData.path!,
      templateId,
    });
  };

  const isValid = formData?.environment && formData.path;

  if (!project) {
    return null;
  }

  return (
    <form onSubmit={handleSumbit} className="flex flex-col gap-y-4">
      <p className="font-medium text-text-color">Create .env file</p>
      <div className="flex items-end gap-x-8">
        <ModeSelect
          selectPlaceholder="Select enviornment"
          emptyPlaceHolder="No environments found"
          selectLabel="Environments"
          options={
            environments
              ?.map((env) => env?.label)
              .filter((label): label is string => Boolean(label)) || []
          }
          value={formData.environment ?? null}
          onSelect={(value) => setFormData((prev) => ({ ...prev, environment: value }))}
        />
        {formData.environment && (
          <ModeSelect
            selectPlaceholder="Select path"
            emptyPlaceHolder="No paths found"
            enableSearch={true}
            options={paths ?? []}
            value={formData.path ?? null}
            onSelect={(value) => setFormData((prev) => ({ ...prev, path: value }))}
          />
        )}
        {formData.path && (
          <ModeSelect
            selectPlaceholder="Select template"
            emptyPlaceHolder="No template found"
            selectLabel="Templates"
            isRequired={false}
            options={templates?.map((template) => template.name) ?? []}
            value={formData.template ?? null}
            onSelect={(value) => setFormData((prev) => ({ ...prev, template: value }))}
          />
        )}
        {isValid && (
          <Button type="submit" variant="secondary" className="w-fit mt-6">
            Create
          </Button>
        )}{" "}
      </div>
    </form>
  );
};

export default EnvCreator;
