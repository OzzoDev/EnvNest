import axios from "axios";
import { Project, Secret } from "../types/types";
import { loadConfig } from "../config/config";
import { SERVER_URL } from "../config";

export const getSecrets = async (
  projectId: Project["id"]
): Promise<Secret[]> => {
  const config = await loadConfig();
  const userId = config?.userId;
  const accessToken = config?.token;

  if (!userId || !accessToken) {
    throw new Error("userId and accessToken are required");
  }

  const { data } = await axios.get(`${SERVER_URL}/secrets`, {
    params: { userId, accessToken, projectId },
  });

  return (
    data.secrets.map(
      (secret: {
        id: number;
        path: string;
        environment: string;
        content: string;
      }) => ({
        id: secret.id,
        path: secret.path,
        environment: secret.environment,
        content: secret.content,
      })
    ) || []
  );
};

export const syncSecrets = async (
  projectId: Project["id"],
  secrets: Secret[]
) => {
  const config = await loadConfig();
  const userId = config?.userId;
  const accessToken = config?.token;

  if (!userId || !accessToken) {
    throw new Error("userId and accessToken are required");
  }

  await axios.post(
    `${SERVER_URL}/secrets`,
    { secrets },
    {
      params: { userId, accessToken, projectId },
    }
  );
};
