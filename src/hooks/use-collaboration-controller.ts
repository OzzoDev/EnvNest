import { useOrgStore } from "@/store/orgStore";
import { trpc } from "@/trpc/client";
import { OrgMember } from "@/types/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const useOrgController = () => {
  const members = useOrgStore((state) => state.org)?.members ?? [];
  const [controlledMembers, setControlledMembers] =
    useState<OrgMember[]>(members);
  const [selectedTab, setSelectedTab] = useState<"Accesss" | "Organizations">(
    "Accesss"
  );
  const [error, setError] = useState<string | null>(null);

  const orgStore = useOrgStore();

  const { org: selectedOrg, setOrg: setSelectedOrg } = orgStore;

  const {
    data: orgs,
    refetch: refetchOrgs,
    error: orgError,
  } = trpc.organization.get.useQuery(undefined, { retry: false });

  const {
    data: projects,
    isLoading: isLoadingProjects,
    isFetching: isFetchingProjects,
    error: projectsError,
    refetch: refetchProjects,
  } = trpc.collaborator.get.useQuery(undefined, { retry: false });

  const { mutate: deleteOrg, isPending: isDeletingOrg } =
    trpc.organization.delete.useMutation({
      onError: (err) => {
        toast.error(err.message || "Something went wrong. Please try again");
      },
      onSuccess: () => {
        toast.success("Organization deleted successfully");

        refetchOrgs();

        setSelectedOrg(null);
      },
    });

  const { mutate: leaveOrg, isPending: isLeavingOrg } =
    trpc.organization.delete.useMutation({
      onError: (err) => {
        toast.error(err.message || "Something went wrong. Please try again");
      },
      onSuccess: () => {
        toast.success("Organization left successfully");

        refetchOrgs();

        setSelectedOrg(null);
      },
    });

  useEffect(() => {
    const err = orgError?.message || projectsError?.message;

    if (err) {
      setError(err);
    } else {
      setError(null);
    }
  }, [orgError, projectsError]);

  useEffect(() => {
    if (selectedOrg) {
      refetchOrgs();
    }
  }, [selectedOrg]);

  useEffect(() => {
    refetchOrgs();
    refetchProjects();
    setSelectedOrg(null);
  }, [selectedTab]);

  return {
    ...orgStore,
    members,
    projects,
    controlledMembers,
    orgs,
    setControlledMembers,
    deleteOrg,
    leaveOrg,
    refetchProjects,
    refetchOrgs,
    error,
    selectedTab,
    setSelectedTab,
    isLoading:
      isLoadingProjects || isFetchingProjects || isDeletingOrg || isLeavingOrg,
  };
};

export type OrgControllerType = ReturnType<typeof useOrgController>;
