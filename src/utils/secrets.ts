import { aesDecrypt, aesEncrypt } from ".";
import { getDbClient } from "../db";
import { Project, Secret, User } from "../types/types";
import dotenv from "dotenv";
dotenv.config();

const ENCRYPTION_ROOT_KEY = process.env.ENCRYPTION_ROOT_KEY;

if (!ENCRYPTION_ROOT_KEY) {
  throw new Error("Missing ENCRYPTION_ROOT_KEY in .env file");
}

export const getSecrets = async (
  projectId: Project["id"],
  userId: User["userId"]
): Promise<Secret[]> => {
  const db = await getDbClient();

  const projectKey = await db.projects.findKey(projectId, userId);

  if (!projectKey) {
    console.log("Project key not found");
    process.exit(1);
  }

  const decryptedKey = aesDecrypt(projectKey, ENCRYPTION_ROOT_KEY);

  const secrets = await db.secrets.find(projectId);

  const decryptedSecrets = secrets.map((secret) => {
    const decryptedContent = aesDecrypt(secret.content, decryptedKey);

    return { ...secret, content: decryptedContent };
  });

  return decryptedSecrets;
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

  const decryptedKey = aesDecrypt(projectKey, ENCRYPTION_ROOT_KEY);

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
