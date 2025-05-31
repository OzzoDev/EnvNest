"use client";

import { ENVIRONMENTS } from "@/config";
import { useState } from "react";
import { Button } from "../ui/button";
import { trpc } from "@/trpc/client";
import Select from "../utils/Select";
import { cn } from "@/lib/utils";

const EnvCreator = () => {
  const [selectedEnvironment, setSelectedEnvironment] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const { data: templates } = trpc.template.getPublic.useQuery();

  console.log(templates);

  if (!templates) {
    return null;
  }

  return (
    <>
      <form>
        <p className="font-medium text-text-color mb-4">Create .env file</p>
        <div className="flex items-end gap-x-8">
          <div>
            <p
              aria-hidden={selectedEnvironment ? "true" : "false"}
              className={cn("text-sm text-destructive mb-2", { invisible: selectedEnvironment })}>
              Required
            </p>
            <Select
              placeholer="Select environment"
              label="Environments"
              data={ENVIRONMENTS.map((env) => env.label)}
              onSelect={setSelectedEnvironment}
            />
          </div>
          {selectedEnvironment && templates.length > 0 && (
            <div>
              <p
                aria-hidden={selectedTemplate ? "true" : "false"}
                className={cn("text-sm text-text-color mb-2", { invisible: selectedTemplate })}>
                Optional
              </p>
              <Select
                placeholer="Select template"
                label="Templates"
                data={templates?.map((template) => template.name)}
                onSelect={setSelectedTemplate}
              />
            </div>
          )}

          {selectedEnvironment && (
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
