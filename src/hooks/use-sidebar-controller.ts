import { useEffect, useState } from "react";
import { trpc } from "@/trpc/client";
import { useProjectStore } from "@/store/projectStore";
import { useVirtualQuery } from "@/hooks/use-virtual-query";
import {
  GithubRepo,
  OrgTable,
  ProjectTable,
  SecretHistory,
} from "@/types/types";
import { useSidebar } from "@/components/ui/sidebar";
import { toast } from "sonner";
import usePrev from "./use-prev";
import { isEqual } from "lodash";
import { useSidebarStore } from "@/store/sidebarStore";

export const useSidebarController = () => {
  const [isReadyToRender, setIsReadyToRender] = useState(true);
  const [hasLoadedSecret, setHasLoadedSecret] = useState(false);
  const { isMobile, toggleSidebar } = useSidebar();
  const [repo, setRepo] = useState<string | null>(null);

  const {
    projectId,
    project,
    secretId,
    secret,
    isDeletingProject,
    isLoading: isLoadingDashBoard,
    setProjectId,
    setSecretId,
    setSecret,
    setIsSaved,
    setHasProjects,
    setHasHistoryLogs,
    clear,
  } = useProjectStore();

  const setLoadingStates = useSidebarStore((state) => state.setLoadingStates);

  const {
    data: projects,
    isLoading: isLoadingProjects,
    isFetching: isFetchingProjects,
    refetch: refetchProjects,
  } = useVirtualQuery<ProjectTable[]>(
    () => trpc.project.get.useQuery(undefined, { retry: false }),
    [projectId, project],
    "projects"
  );

  const {
    data: repos = [],
    isLoading: isLoadingRepos,
    isFetching: isFetchingRepos,
    refetch: refetchRepos,
  } = useVirtualQuery<GithubRepo[]>(
    () => trpc.github.getAvailableRepos.useQuery(undefined, { retry: false }),
    [projectId],
    "repos"
  );

  const {
    data: orgs = [],
    isLoading: isLoadingOrgs,
    isFetching: isFetchingOrgs,
    refetch: refetchOrgs,
  } = useVirtualQuery<OrgTable[]>(
    () => trpc.organization.getAsAdmin.useQuery(undefined, { retry: false }),
    [],
    "orgs"
  );

  const {
    data: logs = [],
    isLoading: isLoadingLogs,
    isFetching: isFetchingLogs,
    refetch: refetchLogs,
  } = useVirtualQuery<SecretHistory[]>(
    () => trpc.secret.getHistory.useQuery(undefined, { retry: false }),
    [],
    "logs"
  );

  const { mutate: saveToHistory, isPending: isSavingToHistory } =
    trpc.secret.saveToHistory.useMutation({
      onSettled: () => {
        setIsReadyToRender(false);
        refetchLogs();
      },
    });

  const { mutate: createProject, isPending: isCreatingProject } =
    trpc.project.create.useMutation({
      onError: () => {
        toast.error("Error creating new project");
      },
      onSuccess: (data) => {
        setRepo(null);
        setProjectId(data.id);
        setSecretId(null);
        setSecret(null);
        setIsSaved(true);
        refetchRepos();
        isMobile && toggleSidebar();
        toast.success(`Project ${data.full_name} created successfully`);
      },
    });

  const prevProjectId = usePrev(projectId);
  const prevSecretId = usePrev(secretId);
  const prevLogs = usePrev(logs);
  const prevSecret = usePrev(secret);

  useEffect(() => {
    const isSetteled =
      !isFetchingProjects &&
      !isFetchingOrgs &&
      !isFetchingRepos &&
      !isFetchingLogs &&
      !isCreatingProject &&
      !isSavingToHistory &&
      !isDeletingProject;

    setIsReadyToRender(isSetteled);
  }, [
    isFetchingProjects,
    isFetchingOrgs,
    isFetchingRepos,
    isFetchingLogs,
    isCreatingProject,
    isSavingToHistory,
    isDeletingProject,
  ]);

  useEffect(() => {
    setLoadingStates([!isReadyToRender]);
  }, [isReadyToRender]);

  useEffect(() => {
    if (prevProjectId !== projectId && prevProjectId !== undefined) {
      refetchOrgs();
      refetchRepos();
      refetchProjects();
    }
  }, [prevProjectId, projectId]);

  useEffect(() => {
    if (!projects || projects.length === 0) {
      clear();
    }

    setHasProjects(!!(projects && projects?.length > 0));
  }, [projects]);

  useEffect(() => {
    if (prevSecretId !== secretId && prevSecretId !== undefined) {
      if (secretId && !hasLoadedSecret) {
        saveToHistory({ secretId });
      }

      setHasLoadedSecret(false);
    }
  }, [secretId, prevSecretId]);

  useEffect(() => {
    if (
      !isEqual(secret, prevSecret) &&
      prevSecret !== undefined &&
      !secret &&
      !secretId
    ) {
      refetchLogs();
    }
  }, [secret, prevSecret]);

  useEffect(() => {
    if (!isEqual(logs, prevLogs) && prevLogs !== undefined) {
      setHasHistoryLogs(logs.length > 0);
    }
  }, [logs, prevLogs]);

  return {
    createProject,
    repos,
    orgs,
    projects,
    logs,
    repo,
    refetchProjects,
    refetchRepos,
    refetchOrgs,
    refetchLogs,
    saveToHistory,
    setRepo,
    isLoading: {
      repos: isLoadingRepos,
      orgs: isLoadingOrgs,
      projects: isLoadingProjects,
      logs: isLoadingLogs,
      creatingProject: isCreatingProject,
      savingHistory: isSavingToHistory,
      any:
        isLoadingRepos ||
        isLoadingLogs ||
        isLoadingOrgs ||
        isLoadingProjects ||
        isCreatingProject ||
        isSavingToHistory,
    },
  };
};

export type SidebarControllerType = ReturnType<typeof useSidebarController>;
