"use client";

import { useProjectStore } from "@/store/projectStore";
import { trpc } from "@/trpc/client";
import { ScrollArea } from "../ui/scroll-area";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import { Button } from "../ui/button";
import AlertDialog from "../utils/AleartDialog";
import { useEffect } from "react";
import { SecretHistory } from "@/types/types";

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

  console.log("Logs: ", logs);

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
            <div key={log.id} className="my-2">
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button
                    onClick={() => loadSecret(log)}
                    variant={log.secret_id === secretId ? "secondary" : "ghost"}
                    className="justify-start w-[240px] text-left">
                    <span className="truncate overflow-hidden whitespace-nowrap block w-full">
                      {log.path}
                    </span>
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="min-w-[240px] w-full py-2">
                  {log.path}
                </HoverCardContent>
              </HoverCard>
            </div>
          ) : (
            <div key={log.id} className="my-2">
              <AlertDialog
                title="Are you sure you want to change .env file?"
                description="Any unsaved changes will be lost. This action cannot be undone."
                action="Continue"
                actionFn={() => loadSecret(log)}>
                <Button
                  variant={log.secret_id === secretId ? "secondary" : "ghost"}
                  className="justify-start w-[240px] text-left">
                  <span className="truncate overflow-hidden whitespace-nowrap block w-full">
                    {log.path}
                  </span>
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
