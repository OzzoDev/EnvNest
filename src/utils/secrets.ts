import axios from "axios";
import { aesDecrypt, aesEncrypt } from ".";
import { getDbClient } from "../db";
import { Project, Secret, User } from "../types/types";
import { loadConfig } from "../config/config";

export const getSecrets = async (
  projectId: Project["id"]
): Promise<Secret[]> => {
  const config = await loadConfig();
  const userId = config?.userId;
  const accessToken = config?.token;

  if (!userId || !accessToken) {
    throw new Error("userId and accessToken are required");
  }

  const { data } = await axios.get(
    "http://localhost:3000/api/auth/cli/secrets",
    {
      params: { userId, accessToken, projectId },
    }
  );

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
  userId: User["userId"],
  secrets: Secret[]
) => {
  const db = await getDbClient();

  const projectKey = await db.projects.findKey(projectId, userId);

  if (!projectKey) {
    console.log("Project key not found");
    process.exit(1);
  }

  const decryptedKey = aesDecrypt(projectKey, "");

  await Promise.all(
    secrets.map((secret) =>
      db.secrets.update(
        userId,
        secret.id,
        aesEncrypt(secret.content, decryptedKey)
      )
    )
  );
};
