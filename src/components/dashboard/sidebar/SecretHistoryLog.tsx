"use client";

import { useProjectStore } from "@/store/projectStore";
import { trpc } from "@/trpc/client";
import { useEffect, useState } from "react";
import { SecretHistory } from "@/types/types";
import { cn, timeAgo } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import AlertDialog from "@/components/utils/AleartDialog";
import { Badge } from "@/components/ui/badge";
import { ENVIRONMENTS } from "@/config";
import SkeletonWrapper from "@/components/utils/loaders/SkeletonWrapper";
import { useSidebar } from "@/components/ui/sidebar";
import { LuHistory } from "react-icons/lu";

const SecretHistoryLog = () => {
  const { state, toggleSidebar } = useSidebar();
  const secretId = useProjectStore((state) => state.secretId);
  const isSaved = useProjectStore((state) => state.isSaved);
  const isLoading = useProjectStore((state) => state.isLoading);

  const setProjectId = useProjectStore((state) => state.setProjectId);
  const setSecretId = useProjectStore((state) => state.setSecretId);

  const [isReadyToRender, setIsReadyToRender] = useState(false);

  const {
    data: logs,
    refetch: refetchLogs,
    isFetching: isFetchingLogs,
  } = trpc.secret.getHistory.useQuery(undefined, { enabled: false });

  useEffect(() => {
    if (!isLoading) {
      setIsReadyToRender(false);
      refetchLogs().then(() => setIsReadyToRender(true));
    }
  }, [isLoading]);

  const loadSecret = (log: SecretHistory) => {
    setProjectId(log.project_id);
    setSecretId(log.secret_id);
  };

  const isLoadingUI = isFetchingLogs || isLoading || !isReadyToRender;

  const isCollapsed = state === "collapsed";

  if (isCollapsed) {
    return (
      <Button onClick={toggleSidebar} variant="ghost">
        <LuHistory size={24} />
      </Button>
    );
  }

  return (
    <SkeletonWrapper skeletons={8} isLoading={isLoadingUI} className="flex flex-col gap-y-4">
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
                <p className={cn({ "text-primary underline": secretId === log.secret_id })}>
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
    </SkeletonWrapper>
  );
};

export default SecretHistoryLog;
