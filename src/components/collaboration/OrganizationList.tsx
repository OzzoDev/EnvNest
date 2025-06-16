"use client";

import { trpc } from "@/trpc/client";
import SkeletonWrapper from "../utils/loaders/SkeletonWrapper";
import OrganizationItem from "./OrganizationItem";

const OrganizationList = () => {
  const {
    data: orgs,
    isLoading: isLoadingOrgs,
    error: orgError,
  } = trpc.organization.get.useQuery(undefined, { retry: false });

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

  return (
    <SkeletonWrapper
      skeletons={5}
      isLoading={isLoadingOrgs}
      width="w-[240px]"
      className="flex flex-col gap-4">
      <ul className="pl-4">
        {orgs?.map((org) => (
          <OrganizationItem key={org.id} org={org} />
        ))}
      </ul>
    </SkeletonWrapper>
  );
};

export default OrganizationList;
