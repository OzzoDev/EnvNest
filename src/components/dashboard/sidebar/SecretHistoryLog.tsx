"use client";

import { useProjectStore } from "@/store/projectStore";
import { SecretHistory } from "@/types/types";
import { cn, timeAgo } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import AlertDialog from "@/components/utils/AleartDialog";
import { Badge } from "@/components/ui/badge";
import { ENVIRONMENTS } from "@/config";
import { useSidebar } from "@/components/ui/sidebar";
import { LuHistory } from "react-icons/lu";
import { SidebarControllerType } from "@/hooks/use-sidebar-controller";

type SecretHistoryLogProps = {
  controller: SidebarControllerType;
};

const SecretHistoryLog = ({ controller }: SecretHistoryLogProps) => {
  const { state, isMobile, toggleSidebar } = useSidebar();
  const secretId = useProjectStore((state) => state.secretId);

  const isSaved = useProjectStore((state) => state.isSaved);
  const setProjectId = useProjectStore((state) => state.setProjectId);
  const setSecretId = useProjectStore((state) => state.setSecretId);

  const { logs, saveToHistory } = controller;

  const loadSecret = (log: SecretHistory) => {
    setProjectId(log.project_id);
    setSecretId(log.secret_id);
    isMobile && toggleSidebar();
    saveToHistory({ secretId: log.secret_id });
  };

  const isCollapsed = state === "collapsed" && !isMobile;

  const hasLogs = logs && logs.length > 0;

  if (isCollapsed && hasLogs) {
    return (
      <Button onClick={toggleSidebar} variant="ghost">
        <LuHistory size={24} />
      </Button>
    );
  }

  if (!hasLogs) {
    return null;
  }

  return (
    <div>
      <p className="text-lg text-text-color mb-8">Your history</p>
      <ScrollArea
        className={cn(
          "flex flex-col gap-y-4 max-h-[500px]",
          isCollapsed ? "overflow-y-hidden" : "overflow-y-auto"
        )}>
        {logs?.map((log) => {
          const logContent = (
            <div className="flex flex-col gap-y-2 w-full">
              <span className="text-text-color text-sm">{log.project}</span>
              <div className="flex justify-between items-center w-full">
                <Badge variant="outline">
                  {ENVIRONMENTS.find((env) => env.value === log.environment)?.label}
                </Badge>
                <span className="text-xs">{timeAgo(log.created_at)}</span>
              </div>
              <p
                className={cn({
                  "text-primary underline": secretId === log.secret_id,
                })}>
                {log.path}
              </p>
            </div>
          );

          return (
            <div key={log.id} className="my-2 px-1">
              {isSaved ? (
                <Button
                  onClick={() => loadSecret(log)}
                  variant="ghost"
                  className={cn(
                    "justify-start w-full text-left break-all whitespace-normal h-auto border-l-2 border-transparent",
                    {
                      "hover:bg-transparent hover:text-foreground": secretId === log.secret_id,
                    }
                  )}>
                  {logContent}
                </Button>
              ) : (
                <AlertDialog
                  title="Are you sure you want to change .env file?"
                  description="Any unsaved changes will be lost. This action cannot be undone."
                  action="Continue"
                  actionFn={() => loadSecret(log)}>
                  <Button
                    onClick={() => loadSecret(log)}
                    variant="ghost"
                    className={cn(
                      "justify-start w-full text-left break-all whitespace-normal h-auto border-l-2 border-transparent",
                      {
                        "hover:bg-transparent hover:text-foreground": secretId === log.secret_id,
                      }
                    )}>
                    {logContent}
                  </Button>
                </AlertDialog>
              )}
            </div>
          );
        })}
      </ScrollArea>
    </div>
  );
};

export default SecretHistoryLog;
