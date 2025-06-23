import { ENVIRONMENTS } from "@/config";
import { FormData as CreateEnvFormData } from "@/components/editor/EnvCreator";
import { FormData as EditEnvFormData } from "@/components/editor/EnvEditor";
import { FormData as SecretSelectorFormData } from "@/components/editor/SecretSelector";
import { useProjectStore } from "@/store/projectStore";
import { trpc } from "@/trpc/client";
import { useEffect, useState } from "react";
import usePrev from "./use-prev";
import { toast } from "sonner";
import { useSidebar } from "@/components/ui/sidebar";
import { isEqual } from "lodash";

export const useDashboardController = () => {
  const {
    project,
    projectId,
    secret,
    secretId,
    projectSecretRefs,
    setProject,
    setProjectId,
    setSecret,
    setSecretId,
    setShowAll,
    addProjectSecretRefs,
    deleteProjectSecretRef,
    setIsSaved,
    deleteProject: unStoreProject,
    setHasProjects,
    setHasHistoryLogs,
    setError,
    clear,
  } = useProjectStore();

  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isActivityLogOpen, setIsActicityLogOpen] = useState<boolean>(false);
  const [updateMessage, setUpdateMessage] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(false);
  const [visibleInputs, setVisibleInputs] = useState<boolean[]>([]);
  const [envVariables, setEnvVariables] = useState<EditEnvFormData["envVariables"]>([]);
  const [createEnvFormData, setCreateEnvFormData] = useState<CreateEnvFormData>({});
  const [secretSelectorFormData, setSecretSelectorFormData] = useState<SecretSelectorFormData>({});
  const { isMobile, toggleSidebar } = useSidebar();
  const [repo, setRepo] = useState<string | null>(null);

  const hasWriteAccess = project?.role === "admin" || project?.role === "editor";

  const [isReadyToRender, setIsReadyToRender] = useState<boolean>(false);

  const prevProjectId = usePrev(projectId);
  const prevSecretId = usePrev(secretId);
  const prevSecret = usePrev(secret);

  const {
    data: projects,
    error: projectsError,
    isLoading: isLoadingProjects,
    refetch: refetchProjects,
  } = trpc.project.get.useQuery(undefined, { retry: false, enabled: false });

  const {
    data: newSecret,
    error: newSecretError,
    isLoading: isLoadingNewSecret,
    refetch: refetchNewSecret,
  } = trpc.secret.get.useQuery(
    { projectId: Number(projectId), secretId: secretId },
    {
      enabled: false,
      retry: false,
    }
  );

  const {
    data: newProject,
    error: newProjectError,
    isLoading: isLoadingNewProject,
    refetch: refetchNewProject,
  } = trpc.project.getById.useQuery(
    { projectId: Number(projectId) },
    {
      enabled: false,
      retry: false,
    }
  );

  const {
    data: environments,
    error: environmentsError,
    refetch: refetchEnvironents,
    isLoading: isLoadingEnvironments,
  } = trpc.environment.getAvailable.useQuery(
    { repo: project?.name!, projectId: Number(projectId) },
    { enabled: false, retry: false }
  );

  const {
    data: paths,
    isLoading: isLoadingPaths,
    error: pathsError,
    refetch: refetchPaths,
  } = trpc.github.getPaths.useQuery(
    {
      repo: project?.name!,
      projectId: Number(projectId),
      environment: ENVIRONMENTS.find((env) => env.label === createEnvFormData.environment)?.value!,
    },
    {
      enabled: false,
      retry: false,
    }
  );

  const {
    data: environmentPaths,
    error: environmentPathsError,
    isLoading: isLoadingEnvironmentPaths,
    refetch: refetchEnvironmentPaths,
  } = trpc.secret.getAllAsPathAndId.useQuery(
    { projectId: Number(projectId) },
    { enabled: false, retry: false }
  );

  const {
    data: auditLogs,
    error: auditLogsError,
    isLoading: isLoadingAuditLogs,
    refetch: refetchAuditLogs,
  } = trpc.auditLog.get.useQuery(
    { projectId: projectId!, secretId: secretId! },
    { enabled: false, retry: false }
  );

  const {
    data: templates,
    error: templatesError,
    isLoading: isLoadingTemplates,
    refetch: refetchTemplates,
  } = trpc.template.getOwnAndPublic.useQuery(undefined, { retry: false, enabled: false });

  const {
    data: repos = [],
    error: reposError,
    isLoading: isLoadingRepos,
    refetch: refetchRepos,
  } = trpc.github.getAvailableRepos.useQuery(undefined, { retry: false, enabled: false });

  const {
    data: orgs = [],
    error: orgsError,
    isLoading: isLoadingOrgs,
    refetch: refetchOrgs,
  } = trpc.organization.getAsAdmin.useQuery(undefined, { retry: false, enabled: false });

  const {
    data: logs = [],
    error: logsError,
    isLoading: isLoadingLogs,
    refetch: refetchLogs,
  } = trpc.secret.getHistory.useQuery(undefined, { retry: false, enabled: false });

  const { mutate: deleteProject, isPending: isDeletingProject } = trpc.project.delete.useMutation({
    onError: (err) => {
      toast.error(err.message || "Something went wrong. Please try again");
    },
    onSuccess: () => {
      if (typeof projectId === "number") {
        deleteProjectSecretRef(projectId);
      }
      unStoreProject();
    },
  });

  const { mutate: updateSecret, isPending: isUpdatingSecret } = trpc.secret.update.useMutation({
    onMutate: () => {
      setUpdateSuccess(false);
    },
    onSuccess: (data) => {
      const envVariables = data.content.split("&&").map((val) => {
        const [name, value] = val.split("=");
        return { name, value };
      });

      setEnvVariables(envVariables);

      setUpdateSuccess(true);
      setIsActicityLogOpen(false);

      setVisibleInputs((prev) => prev.map(() => false));

      refetchAuditLogs();

      toast.success("Successfully saved .env file");
    },
    onError: () => {
      toast.success("Error saving .env file");
    },
    onSettled: () => {
      setUpdateMessage("");
    },
  });

  const { mutate: deleteSecret, isPending: isDeletingSecret } = trpc.secret.delete.useMutation({
    onSuccess: () => {
      toast.success("Successfully deleted .env file");

      deleteProjectSecretRef(projectId!);
      setSecretId(null);
      setSecret(null);
      setVisibleInputs((prev) => prev.map(() => false));
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong. Please try again");
    },
  });

  const { mutate: saveToHistory, isPending: isSavingToHistory } =
    trpc.secret.saveToHistory.useMutation({
      onSettled: () => {
        // setIsReadyToRender(false);
        refetchLogs();
      },
    });

  const { mutate: createProject, isPending: isCreatingProject } = trpc.project.create.useMutation({
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

  const { mutate: createSecret, isPending: isCreatingSecret } = trpc.secret.create.useMutation({
    onSuccess: (secretId) => {
      setSecretId(secretId);
      setCreateEnvFormData({});

      refetchTemplates();
      refetchPaths();

      toast.success(`${createEnvFormData.environment} .env file created successfully`);
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong. Please try again");
    },
  });

  useEffect(() => {
    refetchTemplates();
  }, []);

  useEffect(() => {
    if (!projectId && projects && projects?.length > 0) {
      setProjectId(projects[0].id);
    }
  }, [projects]);

  useEffect(() => {
    if (projectId) {
      refetchNewProject();
      refetchEnvironmentPaths();

      const secretIdRef = projectSecretRefs[projectId!];

      if (secretIdRef && !secretId) {
        setSecretId(secretIdRef);
      }

      if (secretId) {
        refetchNewSecret();
        refetchAuditLogs();
      }
    }

    if (!secretId) {
      if (projectId) {
        const secretIdRef = projectSecretRefs[projectId!];
        if (secretIdRef) {
          setSecretId(secretIdRef);
        }
      }

      setSecret(null);
    }

    if (secretId && projectId) {
      addProjectSecretRefs(projectId, secretId);
    }

    setShowAll(false);
    setIsSaved(true);
  }, [projectId, secretId]);

  useEffect(() => {
    if (newSecret) {
      setSecret(newSecret);
      setSecretId(newSecret.id);
    }
  }, [newSecret]);

  useEffect(() => {
    if (newProject) {
      setProject(newProject);
    }
  }, [newProject]);

  useEffect(() => {
    if (projectId !== prevProjectId && prevProjectId !== undefined) {
      refetchRepos();
      refetchOrgs();
    }
  }, [projectId, prevProjectId]);

  useEffect(() => {
    if (project && projectId) {
      refetchEnvironents();
    }

    refetchProjects();
  }, [project, projectId, prevProjectId]);

  useEffect(() => {
    if (project && projectId && createEnvFormData.environment) {
      refetchPaths();
    }
  }, [project, projectId, createEnvFormData.environment]);

  useEffect(() => {
    if (!projects || projects.length === 0) {
      clear();
    }

    setHasProjects(!!(projects && projects?.length > 0));
  }, [projects]);

  useEffect(() => {
    if (prevSecretId !== secretId && prevSecretId !== undefined) {
      if (secretId) {
        saveToHistory({ secretId });
      }
    }
  }, [secretId, prevSecretId]);

  useEffect(() => {
    if (!isEqual(secret, prevSecret) && prevSecret !== undefined && !secret && !secretId) {
      refetchLogs();
    }

    if (secret) {
      const envVariables = secret.content.split("&&").map((val) => {
        const [name, value] = val.split("=");
        return { name, value };
      });

      setEnvVariables(envVariables);
    }
  }, [secret, prevSecret]);

  const prevLogs = usePrev(logs);

  useEffect(() => {
    if (!isEqual(logs, prevLogs) && prevLogs !== undefined) {
      setHasHistoryLogs(!!(logs && logs?.length > 0));
    }
  }, [logs, prevLogs]);

  useEffect(() => {
    const isSettled =
      !isLoadingProjects &&
      !isLoadingNewSecret &&
      !isLoadingNewProject &&
      !isLoadingEnvironments &&
      !isLoadingPaths &&
      !isLoadingEnvironmentPaths &&
      !isLoadingAuditLogs &&
      !isLoadingTemplates &&
      !isLoadingRepos &&
      !isLoadingOrgs &&
      !isLoadingLogs &&
      !isDeletingProject &&
      !isUpdatingSecret &&
      !isDeletingSecret &&
      !isSavingToHistory &&
      !isCreatingProject &&
      !isCreatingSecret;

    setIsReadyToRender(isSettled);
  }, [
    isLoadingProjects,
    isLoadingNewSecret,
    isLoadingNewProject,
    isLoadingEnvironments,
    isLoadingPaths,
    isLoadingEnvironmentPaths,
    isLoadingAuditLogs,
    isLoadingTemplates,
    isLoadingRepos,
    isLoadingOrgs,
    isLoadingLogs,
    isDeletingProject,
    isUpdatingSecret,
    isDeletingSecret,
    isSavingToHistory,
    isCreatingProject,
    isCreatingSecret,
  ]);

  useEffect(() => {
    const error =
      projectsError?.message ||
      newSecretError?.message ||
      newProjectError?.message ||
      environmentsError?.message ||
      pathsError?.message ||
      environmentPathsError?.message ||
      auditLogsError?.message ||
      templatesError?.message ||
      reposError?.message ||
      orgsError?.message ||
      logsError?.message;

    if (error) {
      setError(error);
    }
  }, [
    projectsError,
    newSecretError,
    newProjectError,
    environmentsError,
    pathsError,
    environmentPathsError,
    auditLogsError,
    templatesError,
    reposError,
    orgsError,
    logsError,
  ]);

  return {
    hasWriteAccess,
    updateSuccess,
    setVisibleInputs,
    isActivityLogOpen,
    setIsActicityLogOpen,
    updateMessage,
    isValid,
    setIsValid,
    visibleInputs,
    deleteProject,
    updateSecret,
    deleteSecret,
    isOpen,
    setIsOpen,
    setUpdateMessage,
    envVariables,
    setEnvVariables,
    createEnvFormData,
    setCreateEnvFormData,
    environments,
    paths,
    templates,
    createSecret,
    environmentPaths,
    auditLogs,
    secretSelectorFormData,
    setSecretSelectorFormData,
    repos,
    orgs,
    projects,
    logs,
    repo,
    createProject,
    setRepo,
    saveToHistory,
    get isLoading() {
      return !isReadyToRender;
    },
  };
};

export type DashBoardControllerType = ReturnType<typeof useDashboardController>;
