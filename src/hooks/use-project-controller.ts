import { FormData as EditEnvFormData } from "@/components/editor/EnvEditor";
import { FormData as CreateEnvFormData } from "@/components/editor/EnvCreator";

import { ENVIRONMENTS } from "@/config";
import { useProjectStore } from "@/store/projectStore";
import { trpc } from "@/trpc/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSidebarStore } from "@/store/sidebarStore";

export const useProjectController = () => {
  const projectStore = useProjectStore();

  const {
    projectId,
    project,
    secret,
    secretId,
    hasHydrated,
    setError,
    setSecretId,
    setSecret,
    deleteProjectSecretRef,
    deleteProject: unStoreProject,
  } = projectStore;

  const isLoadingSidebar = useSidebarStore((state) => state.isLoading);

  const [isReadyToRender, setIsReadyToRender] = useState<boolean>(false);
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isActivityLogOpen, setIsActicityLogOpen] = useState<boolean>(false);
  const [updateMessage, setUpdateMessage] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(false);
  const [visibleInputs, setVisibleInputs] = useState<boolean[]>([]);
  const [envVariables, setEnvVariables] = useState<EditEnvFormData["envVariables"]>([]);
  const [createEnvFormData, setCreateEnvFormData] = useState<CreateEnvFormData>({});

  const hasWriteAccess = project?.role === "admin" || project?.role === "editor";

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

      //   reset({ envVariables });

      setUpdateSuccess(true);
      setIsActicityLogOpen(false);

      setVisibleInputs((prev) => prev.map(() => false));

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

  const {
    data: environments,
    error: environmentsError,
    isLoading: isLoadingEnvironments,
  } = trpc.environment.getAvailable.useQuery(
    { repo: project?.name!, projectId: Number(projectId) },
    { enabled: !!project && !!projectId, retry: false }
  );

  const {
    data: paths,
    error: pathsError,
    isLoading: isLoadingPaths,
    refetch: refetchPaths,
  } = trpc.github.getPaths.useQuery(
    {
      repo: project?.name!,
      projectId: Number(projectId),
      environment: ENVIRONMENTS.find((env) => env.label === createEnvFormData.environment)?.value!,
    },
    { enabled: !!project && !!projectId && !!createEnvFormData.environment, retry: false }
  );

  const {
    data: templates,
    error: templatesError,
    isLoading: isLoadingTemplates,
    refetch: refetchTemplates,
  } = trpc.template.getOwnAndPublic.useQuery(undefined, { retry: false });

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

  const {
    data: environmentPaths,
    error: environmentPathsError,
    isLoading: isLoadingEnvironmentPaths,
    refetch: refetchEnvironmentPaths,
  } = trpc.secret.getAllAsPathAndId.useQuery(
    { projectId: Number(projectId) },
    { enabled: !!projectId && hasHydrated, retry: false }
  );

  const {
    data: auditLogs,
    error: auditLogsError,
    isLoading: isLoadingAuditLogs,
    refetch: refetchAuditLogs,
  } = trpc.auditLog.get.useQuery(
    { projectId: projectId!, secretId: secretId! },
    { enabled: !!secretId && !!projectId, retry: false }
  );

  useEffect(() => {
    const isSetteled =
      !isDeletingProject &&
      !isUpdatingSecret &&
      !isDeletingSecret &&
      !isLoadingEnvironments &&
      !isLoadingPaths &&
      !isLoadingTemplates &&
      !isCreatingSecret &&
      !isLoadingEnvironmentPaths &&
      !isLoadingAuditLogs &&
      !isLoadingSidebar;

    setIsReadyToRender(isSetteled);
  }, [
    isDeletingProject,
    isUpdatingSecret,
    isDeletingProject,
    isLoadingEnvironments,
    isLoadingPaths,
    isLoadingTemplates,
    isCreatingSecret,
    isLoadingEnvironmentPaths,
    isLoadingAuditLogs,
    isLoadingSidebar,
  ]);

  useEffect(() => {
    setError(
      (environmentsError?.message ||
        pathsError?.message ||
        templatesError?.message ||
        environmentPathsError?.message ||
        auditLogsError?.message) ??
        null
    );
  }, [environmentsError, pathsError, templatesError, environmentPathsError, auditLogsError]);

  useEffect(() => {
    refetchEnvironmentPaths();
  }, [secretId, secret, projectId]);

  useEffect(() => {
    refetchAuditLogs();
  }, [updateSuccess]);

  return {
    ...projectStore,
    isLoading: !isReadyToRender,
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
  };
};

export type ProjectControllerType = ReturnType<typeof useProjectController>;
