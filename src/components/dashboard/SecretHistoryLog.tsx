"use client";

import { useProjectStore } from "@/store/projectStore";
import { trpc } from "@/trpc/client";
import { ScrollArea } from "../ui/scroll-area";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import { Button } from "../ui/button";
import AlertDialog from "../utils/AleartDialog";
import { useEffect } from "react";
import { SecretHistory } from "@/types/types";
import { cn } from "@/lib/utils";

const SecretHistoryLog = () => {
  const secretId = useProjectStore((state) => state.secretId);
  const secret = useProjectStore((state) => state.secret);
  const isSaved = useProjectStore((state) => state.isSaved);

  const setProjectId = useProjectStore((state) => state.setProjectId);
  const setSecretId = useProjectStore((state) => state.setSecretId);

  const { data: logs, refetch: refetchLogs } = trpc.secret.getHistory.useQuery();

  useEffect(() => {
    refetchLogs();
  }, [secret]);

  const loadSecret = (log: SecretHistory) => {
    setProjectId(log.project_id);
    setSecretId(log.secret_id);
  };

  return (
    <div>
      <p className="text-lg text-text-color mb-8">Your history</p>
      <ScrollArea className="flex flex-col gap-y-4 max-h-[500px] overflow-y-auto">
        {logs?.map((log) => {
          return isSaved ? (
            <div key={log.id} className="my-2 px-1">
              <Button
                key={log.id}
                onClick={() => loadSecret(log)}
                variant="ghost"
                className={cn(
                  "justify-start w-full text-left break-all whitespace-normal h-auto border-l-2 border-transparent",
                  {
                    "hover:bg-transparent hover:text-primary underline text-primary":
                      secretId === log.secret_id,
                  }
                )}>
                {log.path}
              </Button>
            </div>
          ) : (
            <div key={log.id} className="my-2 px-1">
              <AlertDialog
                title="Are you sure you want to change .env file?"
                description="Any unsaved changes will be lost. This action cannot be undone."
                action="Continue"
                actionFn={() => loadSecret(log)}>
                <Button
                  key={log.id}
                  onClick={() => loadSecret(log)}
                  variant="ghost"
                  className={cn(
                    "justify-start w-full text-left break-all whitespace-normal h-auto border-l-2 border-transparent",
                    {
                      "hover:bg-transparent hover:text-primary underline text-primary":
                        secretId === log.secret_id,
                    }
                  )}>
                  {log.path}
                </Button>
              </AlertDialog>
            </div>
          );
        })}
      </ScrollArea>
    </div>
  );
};

export default SecretHistoryLog;
