"use client";

import { trpc } from "@/trpc/client";
import OrganizationItem from "./OrganizationItem";
import { toast } from "sonner";
import { Org } from "@/types/types";
import { useOrgContext } from "@/context/OrgContext";

const OrganizationList = () => {
  const { orgs, setOrg: setSelectedOrg, refetchOrgs } = useOrgContext();

  const { mutate: deleteOrg, isPending: isDeletingOrg } = trpc.organization.delete.useMutation({
    onError: (err) => {
      toast.error(err.message || "Something went wrong. Please try again");
    },
    onSuccess: () => {
      toast.success("Organization deleted successfully");

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

  if (orgs?.length === 0) {
    return <p className="text-muted-foreground text-sm">No orgranization created</p>;
  }

  return (
    <ul className="pl-4">
      {orgs?.map((org) => (
        <OrganizationItem
          key={org.id}
          org={org as Org}
          onDestructive={() => handleDestructive(org as Org)}
        />
      ))}
    </ul>
  );
};

export default OrganizationList;
