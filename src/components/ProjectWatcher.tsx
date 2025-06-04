"use client";

import { useProjectStore } from "@/store/projectStore";
import { trpc } from "@/trpc/client";
import { useEffect } from "react";

const ProjectWatcher = () => {
  const projectId = useProjectStore((state) => state.projectId);
  const hasHydrated = useProjectStore((state) => state.hasHydrated);
  const secretId = useProjectStore((state) => state.secretId);
  const setProjectId = useProjectStore((state) => state.setProjectId);
  const setProject = useProjectStore((state) => state.setProject);
  const setSecret = useProjectStore((state) => state.setSecret);

  const { data: projects } = trpc.project.getAll.useQuery();

  const { data: updatedSecret, refetch: refetchSecret } = trpc.secret.get.useQuery(
    { projectId: Number(projectId), secretId: Number(secretId) },
    { enabled: !!projectId && !!secretId && hasHydrated }
  );

  const { data: updatedProject, refetch: refetchProject } = trpc.project.get.useQuery(
    { projectId: Number(projectId) },
    { enabled: !!projectId && hasHydrated }
  );

  useEffect(() => {
    if (!projectId && projects && projects?.length > 0) {
      setProjectId(projects[0].id);
    }
  }, [projects]);

  useEffect(() => {
    if (projectId && secretId) {
      refetchSecret();
    }
  }, [projectId, secretId]);

  useEffect(() => {
    if (updatedSecret) {
      setSecret(updatedSecret);
    }
  }, [updatedSecret]);

  useEffect(() => {
    if (projectId) {
      refetchProject();
    }
  }, [projectId]);

  useEffect(() => {
    if (updatedProject) {
      setProject(updatedProject);
    }
  }, [updatedProject]);

  return null;
};

export default ProjectWatcher;
