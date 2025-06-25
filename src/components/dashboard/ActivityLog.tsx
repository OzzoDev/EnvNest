import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ENVIRONMENTS } from "@/config";
import { convertToLocalTime } from "@/lib/utils";
import AuditLogItem from "./AuditlogItem";
import { toast } from "sonner";
import { useDashboardContext } from "@/context/DashboardContext";
import { useProjectStore } from "@/store/projectStore";
import { useEffect, useState } from "react";

type UpdateSecretArgs = {
  projectId: number;
  secretId: number;
  content: string;
  type: string;
  updateMessage: string;
};

type ActivityLogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  updateSecret: (args: UpdateSecretArgs) => void;
};

const ActivityLog = ({ isOpen, setIsOpen, updateSecret }: ActivityLogProps) => {
  const { projectId, secretId, project, secret } = useProjectStore();
  const { auditLogs, updateSuccess } = useDashboardContext();

  const [controlledAuditLogs, setControlledAuditLogs] = useState<typeof auditLogs>(auditLogs);

  useEffect(() => {
    setControlledAuditLogs(auditLogs);
  }, [isOpen]);

  const onRollback = (auditLogId: number) => {
    const auditLog = auditLogs?.find((audit) => audit.id === auditLogId);

    if (!auditLog || !projectId || !secretId) {
      toast.error("Error rolling back to this version");
      return;
    }

    const [date, time] = convertToLocalTime(auditLog.created_at).split(" ");

    updateSecret({
      projectId,
      secretId,
      content: auditLog.content,
      type: "ROLLBACK",
      updateMessage: `Rolled back to ${auditLog.metadata.type} at ${date} / ${time}`,
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">Activity log</Button>
      </SheetTrigger>
      <SheetContent className="pr-4 overflow-y-auto">
        <SheetHeader className="mb-8">
          <SheetTitle>Activity log</SheetTitle>
          <SheetDescription className="flex flex-col gap-y-2">
            <span className="font-semibold text-base text-muted-foreground">
              {project?.full_name}
            </span>
            <span className="flex flex-col">
              <span className="font-medium text-xs text-muted-foreground">
                {ENVIRONMENTS.find((env) => env.value === secret?.environment)?.label}
              </span>
              <span className="font-medium text-xs text-muted-foreground">{secret?.path}</span>
            </span>
          </SheetDescription>
        </SheetHeader>
        <ul className="flex flex-col gap-y-8">
          {controlledAuditLogs?.map((audit) => (
            <AuditLogItem key={audit.id} audit={audit} onRollback={onRollback} />
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
};

export default ActivityLog;
