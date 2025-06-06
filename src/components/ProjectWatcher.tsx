"use client";

import { useProjectStore } from "@/store/projectStore";
import { trpc } from "@/trpc/client";
import { useEffect } from "react";
import { toast } from "sonner";

const ProjectWatcher = () => {
  const projectId = useProjectStore((state) => state.projectId);
  const hasHydrated = useProjectStore((state) => state.hasHydrated);
  const secretId = useProjectStore((state) => state.secretId);
  const isSaved = useProjectStore((state) => state.isSaved);

  const setProjectId = useProjectStore((state) => state.setProjectId);
  const setProject = useProjectStore((state) => state.setProject);
  const setSecret = useProjectStore((state) => state.setSecret);
  const setSecretId = useProjectStore((state) => state.setSecretId);

  const { data: projects } = trpc.project.getAll.useQuery();

  const { data: updatedSecret, refetch: refetchSecret } = trpc.secret.get.useQuery(
    { projectId: Number(projectId), secretId: secretId },
    { enabled: !!projectId && hasHydrated, retry: false }
  );

  const { data: updatedProject, refetch: refetchProject } = trpc.project.get.useQuery(
    { projectId: Number(projectId) },
    { enabled: !!projectId && hasHydrated, retry: false }
  );

  useEffect(() => {
    if (!projectId && projects && projects?.length > 0) {
      setProjectId(projects[0].id);
    }
  }, [projects]);

  useEffect(() => {
    if (secretId) {
      refetchSecret();
    }
  }, [secretId]);

  useEffect(() => {
    if (!secretId) {
      setSecret(null);
    }
  }, [secretId]);

  useEffect(() => {
    if (updatedSecret) {
      setSecret(updatedSecret);
      setSecretId(updatedSecret.id);
    }
  }, [updatedSecret]);

  useEffect(() => {
    setSecretId(null);
    setSecret(null);

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
