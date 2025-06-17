"use client";

import { trpc } from "@/trpc/client";
import SkeletonWrapper from "../utils/loaders/SkeletonWrapper";
import OrganizationItem from "./OrganizationItem";
import { toast } from "sonner";
import { Org } from "@/types/types";
import { useEffect, useState } from "react";
import { useOrgStore } from "@/store/orgStore";

const OrganizationList = () => {
  const selectedOrg = useOrgStore((state) => state.org);
  const setSelectedOrg = useOrgStore((state) => state.setOrg);
  const [isReadyToRender, setIsReadyToRender] = useState<boolean>(true);

  const {
    data: orgs,
    isLoading: isLoadingOrgs,
    isFetching: isFetchingOrgs,
    refetch: refetchOrgs,
    error: orgError,
  } = trpc.organization.get.useQuery(undefined, { retry: false });

  useEffect(() => {
    if (selectedOrg === null) {
      setIsReadyToRender(false);
      refetchOrgs();
    }
  }, [selectedOrg]);

  useEffect(() => {
    if (!isFetchingOrgs && !orgError) {
      setIsReadyToRender(true);
    }
  }, [isFetchingOrgs]);

  const { mutate: deleteOrg, isPending: isDeletingOrg } = trpc.organization.delete.useMutation({
    onError: (err) => {
      toast.error(err.message || "Something went wrong. Please try again");
    },
    onSuccess: () => {
      toast.success("Organization deleted successfully");

      setIsReadyToRender(false);
      refetchOrgs();

      setSelectedOrg(null);
    },
  });

  const { mutate: leaveOrg, isPending: isLeavingOrg } = trpc.organization.delete.useMutation({
    onError: (err) => {
      toast.error(err.message || "Something went wrong. Please try again");
    },
    onSuccess: () => {
      toast.success("Organization left successfully");

      setIsReadyToRender(false);
      refetchOrgs();

      setSelectedOrg(null);
    },
  });

  const handleDestructive = (org: Org) => {
    if (org.role === "admin") {
      deleteOrg(org.id);
    } else {
      leaveOrg(org.id);
    }
  };

  if (orgError) {
    return (
      <p className="pl-4 text-sm text-destructive">
        {orgError.message || "Error loading organizations"}
      </p>
    );
  }

  if (orgs?.length === 0) {
    return <p className="text-muted-foreground text-sm">No orgranizations created</p>;
  }

  const isLoadingUi = isLoadingOrgs || isDeletingOrg || isLeavingOrg || !isReadyToRender;

  return (
    <SkeletonWrapper
      skeletons={orgs?.length ?? 5}
      isLoading={isLoadingUi}
      width="w-[240px]"
      className="flex flex-col gap-4">
      <ul className="pl-4">
        {orgs?.map((org) => (
          <OrganizationItem
            key={org.id}
            org={org as Org}
            onDestructive={() => handleDestructive(org as Org)}
          />
        ))}
      </ul>
    </SkeletonWrapper>
  );
};

export default OrganizationList;
