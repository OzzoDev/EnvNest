"use client";

import { Org } from "@/types/types";
import { Badge } from "../ui/badge";
import { capitalize } from "@/lib/utils";
import { Button } from "../ui/button";
import AlertDialog from "../utils/AleartDialog";
import { useOrgStore } from "@/store/orgStore";

type OrganizationItemProps = {
  org: Org;
  onDestructive: () => void;
};

const OrganizationItem = ({ org, onDestructive }: OrganizationItemProps) => {
  const selectedOrg = useOrgStore((state) => state.org);
  const setSelectedOrg = useOrgStore((state) => state.setOrg);
  const isSaved = useOrgStore((state) => state.isSaved);

  const isAdmin = org.role === "admin";

  return (
    <li className="flex flex-col gap-8 py-4 border-b">
      <div className="flex items-center gap-8">
        <p className="text-lg">{org.name}</p>

        <Badge variant="outline" className="h-fit w-fit">
          {capitalize(org.role)}
        </Badge>
      </div>
      <div className="flex gap-4">
        <AlertDialog
          title={isAdmin ? "Delete organization" : "Leave organization"}
          description={`Are you sure you want ${
            isAdmin ? "delete" : "leave"
          } this organization. This action can't be undone`}
          action={isAdmin ? "Delete" : "Leave"}
          actionFn={onDestructive}>
          <Button variant="secondary" size="sm">
            {isAdmin ? "Delete" : "Leave"}
          </Button>
        </AlertDialog>
        <AlertDialog
          title="Change organization"
          description="You have not saved your current organization. Create or update it to save it. Any unsaved changes will be lost"
          action="Continue"
          actionFn={() => setSelectedOrg(org)}
          unsafe={isSaved}>
          <Button variant="outline" size="sm" disabled={org.id === selectedOrg?.id}>
            Manage
          </Button>
        </AlertDialog>
      </div>
    </li>
  );
};

export default OrganizationItem;
