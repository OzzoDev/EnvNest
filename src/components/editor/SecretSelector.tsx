"use client";

import { useEffect, useMemo, useState } from "react";
import ModeSelect from "../utils/ModeSelect";
import { ENVIRONMENTS } from "@/config";
import { useProjectControllerContext } from "@/context/ProjectControllerContext";

const SecretSelector = () => {
  const { secretId, isSaved, setSecretId, setSecret, environmentPaths, isLoading } =
    useProjectControllerContext();

  const [formData, setFormData] = useState<{
    prevEnvironment?: string;
    environment?: string;
    path?: string;
    secretId?: number;
  }>({ secretId: secretId ?? undefined });

  useEffect(() => {
    if (secretId) {
      const envKey = Object.entries(environmentPaths ?? {}).find(([_, paths]) =>
        paths.some((path) => path.id === secretId)
      )?.[0];

      if (envKey && formData.environment !== envKey && environmentPaths) {
        const label = ENVIRONMENTS.find((env) => env.value === envKey)?.label;

        const currentEnvironmentPaths = environmentPaths[envKey];
        const currentPath = currentEnvironmentPaths.find((path) => path.id === secretId);

        setFormData({
          prevEnvironment: label,
          environment: label,
          path: currentPath?.path,
          secretId: currentPath?.id,
        });
      } else {
        setFormData({});
      }
    } else {
      setFormData({});
    }
  }, [environmentPaths, secretId]);

  useEffect(() => {
    const prevEnvironment = formData.prevEnvironment;
    const currentEnvironment = formData.environment;

    const environmentKey = ENVIRONMENTS.find((env) => env.label === currentEnvironment)?.value;

    const path =
      secretId && environmentPaths?.[environmentKey || ""]
        ? environmentPaths?.[environmentKey || ""].find((path) => path.id === secretId)?.path
        : environmentPaths?.[environmentKey || ""]?.[0].path ?? undefined;

    if (prevEnvironment !== currentEnvironment && prevEnvironment) {
      setFormData((prev) => ({
        ...prev,
        path,
        secretId: undefined,
      }));
      setSecret(null);
    } else {
      setFormData((prev) => ({
        ...prev,
        path,
        prevEnvironment: currentEnvironment,
      }));
    }
  }, [formData.environment]);

  useEffect(() => {
    if (formData.path && environmentPaths) {
      const envKey = ENVIRONMENTS.find((env) => env.label === formData.environment)?.value;

      if (envKey) {
        const currentEnvironmentPaths = environmentPaths[envKey];

        const currentPath = currentEnvironmentPaths.find((path) => path.path === formData.path);

        setFormData((prev) => ({ ...prev, secretId: currentPath?.id }));
      }
    }
  }, [formData.path]);

  useEffect(() => {
    if (formData.secretId) {
      setSecretId(formData.secretId);
    }
  }, [formData.secretId]);

  const environments = Object.keys(environmentPaths ?? {}).map(
    (key) => ENVIRONMENTS.find((env) => env.value === key)?.label || key
  );

  const selectedKey = ENVIRONMENTS.find((env) => env.label === formData.environment)?.value;

  const paths = useMemo(() => {
    const availablePaths = environmentPaths?.[selectedKey!]?.map((sec) => sec.path) ?? [];

    const isValidPath = availablePaths.includes(formData.path!);

    if (!isValidPath) {
      setFormData((prev) => ({ ...prev, path: undefined }));
    }

    return availablePaths;
  }, [formData.environment, environmentPaths]);

  const hide = Object.keys(environmentPaths ?? {}).length === 0;

  if (hide || isLoading) {
    return null;
  }

  return (
    <div>
      <p className="font-medium text-text-color mb-4">View and edit .env file</p>

      <div className="flex flex-col lg:flex-row gap-4">
        <ModeSelect
          selectPlaceholder="Select environment"
          selectLabel="Environments"
          disabled={!isSaved}
          options={environments}
          value={formData.environment}
          onSelect={(value) => setFormData((prev) => ({ ...prev, environment: value }))}
        />
        {formData.environment && (
          <ModeSelect
            selectPlaceholder="Select path"
            selectLabel="Paths"
            disabled={!isSaved}
            options={paths}
            value={formData.path}
            onSelect={(value) => setFormData((prev) => ({ ...prev, path: value }))}
          />
        )}
      </div>
    </div>
  );
};

export default SecretSelector;
