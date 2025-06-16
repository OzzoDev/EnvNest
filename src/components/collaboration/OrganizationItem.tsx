"use client";

import { OrgWithRole } from "@/types/types";
import { Badge } from "../ui/badge";
import { capitalize } from "@/lib/utils";
import { Button } from "../ui/button";
import AlertDialog from "../utils/AleartDialog";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

type OrganizationItemProps = {
  org: OrgWithRole;
  onDestructive: () => void;
};

const OrganizationItem = ({ org, onDestructive }: OrganizationItemProps) => {
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
        <Button variant="outline" size="sm">
          Manage
        </Button>
      </div>
    </li>
  );
};

export default OrganizationItem;
