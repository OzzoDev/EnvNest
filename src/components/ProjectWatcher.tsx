"use client";

import { useProjectStore } from "@/store/projectStore";
import { trpc } from "@/trpc/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const ProjectWatcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const projectId = useProjectStore((state) => state.projectId);
  const setProjectId = useProjectStore((state) => state.setProjectId);

  const { data: projects } = trpc.project.getAllProjects.useQuery();

  useEffect(() => {
    if (!projectId && projects && projects?.length > 0) {
      setProjectId(projects[0].id.toString());
    }
  }, [projects]);

  useEffect(() => {
    if (projectId) {
      const params = new URLSearchParams(searchParams.toString());

      if (searchParams.get("projectId") !== projectId) {
        params.set("projectId", projectId);
        router.push(`${pathname}?${params.toString()}`);
      }
    }
  }, [projectId]);

  return null;
};

export default ProjectWatcher;
