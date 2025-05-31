"use client";

import { ENVIRONMENTS } from "@/config";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { trpc } from "@/trpc/client";
import Select from "../utils/Select";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/store/projectStore";
import Combobox from "../utils/Combobox";
import { RepoPath } from "@/types/types";

const EnvCreator = () => {
  const [environment, setEnviornment] = useState<string | null>(null);
  const [template, setTemplate] = useState<string | null>(null);
  const [path, setPath] = useState<RepoPath | null>(null);
  const project = useProjectStore((state) => state.project);

  console.log("project: ", project);

  const { data: paths } = trpc.github.getPaths.useQuery(
    { owner: project?.owner!, repo: project?.name! },
    { enabled: !!project }
  );

  console.log("Path:", paths);

  const { data: templates } = trpc.template.getPublic.useQuery();

  return (
    <>
      <form>
        <p className="font-medium text-text-color mb-4">Create .env file</p>
        <div className="flex items-end gap-x-8">
          <div>
            <p
              aria-hidden={environment ? "true" : "false"}
              className={cn("text-sm text-destructive mb-2", { invisible: environment })}>
              Required
            </p>
            <Select
              placeholer="Select environment"
              label="Environments"
              data={ENVIRONMENTS.map((env) => env.label)}
              onSelect={setEnviornment}
            />
          </div>
          <div>
            <p
              aria-hidden={path ? "true" : "false"}
              className={cn("text-sm text-destructive mb-2", { invisible: path })}>
              Required
            </p>
            <Combobox<RepoPath, "path", "path", "path">
              data={paths ?? []}
              value={path}
              labelKey="path"
              valueKey="path"
              mapKey="path"
              searchMessage="Search paths..."
              selectMessage="Select path"
              emptyMessage="No path found"
              setValue={setPath}
            />
          </div>
          {templates && templates.length > 0 && (
            <div>
              <p
                aria-hidden={template ? "true" : "false"}
                className={cn("text-sm text-text-color mb-2", { invisible: template })}>
                Optional
              </p>
              <Select
                placeholer="Select template"
                label="Templates"
                data={templates?.map((template) => template.name)}
                onSelect={setTemplate}
              />
            </div>
          )}

          {environment && path && (
            <Button type="submit" variant="secondary">
              Create
            </Button>
          )}
        </div>
      </form>
    </>
  );
};

export default EnvCreator;
