"use client";

import { useProjectStore } from "@/store/projectStore";
import { trpc } from "@/trpc/client";
import { useEffect, useMemo, useState } from "react";
import ModeSelect from "../utils/ModeSelect";
import { ENVIRONMENTS } from "@/config";

const SecretSelector = () => {
  const projectId = useProjectStore((state) => state.projectId);
  const hasHydrated = useProjectStore((state) => state.hasHydrated);

  const [formData, setFormData] = useState<{ environment?: string; path?: string }>({});

  const { data: secrets } = trpc.secret.getAllAsPathAndId.useQuery(
    { projectId: Number(projectId) },
    { enabled: !!projectId && hasHydrated }
  );

  useEffect(() => {
    const firstEnvKey = Object.keys(secrets ?? {})[0];
    if (firstEnvKey && formData.environment !== firstEnvKey) {
      const label = ENVIRONMENTS.find((env) => env.value === firstEnvKey)?.label;
      setFormData((prev) => ({ ...prev, environment: label }));
    }
  }, [secrets]);

  const environments = Object.keys(secrets ?? {}).map(
    (key) => ENVIRONMENTS.find((env) => env.value === key)?.label || key
  );

  const selectedKey = ENVIRONMENTS.find((env) => env.label === formData.environment)?.value;

  const paths = useMemo(() => {
    return secrets?.[selectedKey!]?.map((sec) => sec.path) ?? [];
  }, [formData.environment, secrets]);

  return (
    <div className="flex gap-x-8">
      <ModeSelect
        selectPlaceholder="Select environment"
        selectLabel="Environments"
        isRequired={false}
        options={environments}
        value={formData.environment}
        onSelect={(value) => setFormData((prev) => ({ ...prev, environment: value }))}
      />
      <ModeSelect
        selectPlaceholder="Select path"
        selectLabel="Paths"
        isRequired={false}
        options={paths}
        value={formData.path}
        onSelect={(value) => setFormData((prev) => ({ ...prev, path: value }))}
      />
    </div>
  );
};

export default SecretSelector;
