"use client";

import { useProjectStore } from "@/store/projectStore";
import { trpc } from "@/trpc/client";
import { useEffect } from "react";

const ProjectWatcher = () => {
  const projectId = useProjectStore((state) => state.projectId);
  const hasHydrated = useProjectStore((state) => state.hasHydrated);
  const setProjectId = useProjectStore((state) => state.setProjectId);
  const setProject = useProjectStore((state) => state.setProject);

  const { data: projects } = trpc.project.getAllProjects.useQuery();

  const { data: projectSecret, refetch: refetchProjectSecret } =
    trpc.project.getProjectSecret.useQuery(
      { projectId: Number(projectId) },
      { enabled: !!projectId && hasHydrated }
    );

  useEffect(() => {
    if (!projectId && projects && projects?.length > 0) {
      setProjectId(projects[0].id);
    }
  }, [projects]);

  useEffect(() => {
    if (projectId) {
      refetchProjectSecret();
    }
  }, [projectId]);

  useEffect(() => {
    if (projectSecret) {
      setProject(projectSecret);
    }
  }, [projectSecret]);

  return null;
};

export default ProjectWatcher;
