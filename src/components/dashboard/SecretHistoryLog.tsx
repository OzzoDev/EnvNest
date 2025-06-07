"use client";

import { trpc } from "@/trpc/client";

const SecretHistoryLog = () => {
  const { data: logs } = trpc.secret.getHistory.useQuery();

  console.log("Logs: ", logs);

  return null;
};

export default SecretHistoryLog;
