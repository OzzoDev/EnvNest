"use client";

import { useEffect, useMemo } from "react";
import ModeSelect from "../utils/ModeSelect";
import { ENVIRONMENTS } from "@/config";
import { useProjectStore } from "@/store/projectStore";
import { useDashboardContext } from "@/context/DashboardContext";

export type FormData = {
  prevEnvironment?: string;
  environment?: string;
  path?: string;
  secretId?: number;
};

const SecretSelector = () => {
  const { secretId, isSaved, setSecretId, setSecret } = useProjectStore();

  const {
    environmentPaths,
    isLoading,
    secretSelectorFormData,
    setSecretSelectorFormData,
  } = useDashboardContext();

  useEffect(() => {
    if (secretId) {
      const envKey = Object.entries(environmentPaths ?? {}).find(([, paths]) =>
        paths.some((path) => path.id === secretId)
      )?.[0];

      if (
        envKey &&
        secretSelectorFormData.environment !== envKey &&
        environmentPaths
      ) {
        const label = ENVIRONMENTS.find((env) => env.value === envKey)?.label;

        const currentEnvironmentPaths = environmentPaths[envKey];
        const currentPath = currentEnvironmentPaths.find(
          (path) => path.id === secretId
        );

        setSecretSelectorFormData({
          prevEnvironment: label,
          environment: label,
          path: currentPath?.path,
          secretId: currentPath?.id,
        });
      } else {
        setSecretSelectorFormData({});
      }
    } else {
      setSecretSelectorFormData({});
    }
  }, [environmentPaths, secretId]);

  useEffect(() => {
    const prevEnvironment = secretSelectorFormData.prevEnvironment;
    const currentEnvironment = secretSelectorFormData.environment;

    const environmentKey = ENVIRONMENTS.find(
      (env) => env.label === currentEnvironment
    )?.value;

    const path =
      secretId && environmentPaths?.[environmentKey || ""]
        ? environmentPaths?.[environmentKey || ""].find(
            (path) => path.id === secretId
          )?.path
        : environmentPaths?.[environmentKey || ""]?.[0].path ?? undefined;

    if (prevEnvironment !== currentEnvironment && prevEnvironment) {
      setSecretSelectorFormData((prev) => ({
        ...prev,
        path,
        secretId: undefined,
      }));
      setSecret(null);
    } else {
      setSecretSelectorFormData((prev) => ({
        ...prev,
        path,
        prevEnvironment: currentEnvironment,
      }));
    }
  }, [secretSelectorFormData.environment]);

  useEffect(() => {
    if (secretSelectorFormData.path && environmentPaths) {
      const envKey = ENVIRONMENTS.find(
        (env) => env.label === secretSelectorFormData.environment
      )?.value;

      if (envKey) {
        const currentEnvironmentPaths = environmentPaths[envKey];

        const currentPath = currentEnvironmentPaths.find(
          (path) => path.path === secretSelectorFormData.path
        );

        setSecretSelectorFormData((prev) => ({
          ...prev,
          secretId: currentPath?.id,
        }));
      }
    }
  }, [secretSelectorFormData.path]);

  useEffect(() => {
    if (secretSelectorFormData.secretId) {
      setSecretId(secretSelectorFormData.secretId);
    }
  }, [secretSelectorFormData.secretId]);

  const environments = Object.keys(environmentPaths ?? {}).map(
    (key) => ENVIRONMENTS.find((env) => env.value === key)?.label || key
  );

  const selectedKey = ENVIRONMENTS.find(
    (env) => env.label === secretSelectorFormData.environment
  )?.value;

  const paths = useMemo(() => {
    return environmentPaths?.[selectedKey!]?.map((sec) => sec.path) ?? [];
  }, [selectedKey, environmentPaths]);

  useEffect(() => {
    const isValidPath = paths.includes(secretSelectorFormData.path!);

    if (!isValidPath && secretSelectorFormData.path !== undefined) {
      setSecretSelectorFormData((prev) => ({ ...prev, path: undefined }));
    }
  }, [paths, secretSelectorFormData.path]);

  const hide = Object.keys(environmentPaths ?? {}).length === 0;

  if (hide || isLoading) {
    return null;
  }

  return (
    <div>
      <p className="font-medium text-text-color mb-4">
        View and edit .env file
      </p>

      <div className="flex flex-col lg:flex-row gap-4">
        <ModeSelect
          selectPlaceholder="Select environment"
          selectLabel="Environments"
          disabled={!isSaved}
          options={environments}
          value={secretSelectorFormData.environment}
          onSelect={(value) =>
            setSecretSelectorFormData((prev) => ({
              ...prev,
              environment: value,
            }))
          }
        />
        {secretSelectorFormData.environment && (
          <ModeSelect
            selectPlaceholder="Select path"
            selectLabel="Paths"
            disabled={!isSaved}
            options={paths}
            value={secretSelectorFormData.path}
            onSelect={(value) =>
              setSecretSelectorFormData((prev) => ({ ...prev, path: value }))
            }
          />
        )}
      </div>
    </div>
  );
};

export default SecretSelector;
