import { z } from "zod";
import { privateProcedure } from "../trpc";
import { getDbClient } from "@/lib/db/models";
import { TRPCError } from "@trpc/server";
import { aesDecrypt } from "@/lib/aes-helpers";

export const auditLogRouter = {
  get: privateProcedure
    .input(z.object({ projectId: z.number(), secretId: z.number() }))
    .query(async ({ input, ctx }) => {
      const { projectId, secretId } = input;
      const { user } = ctx;
      const { id: gihubId } = user;

      const db = await getDbClient();

      const projectKey = (await db.project.getKey(projectId, gihubId))?.encrypted_key;

      if (!projectKey) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Encryption key not found" });
      }

      const auditLogs = await db.auditLog.get(secretId);

      const decryptedKey = aesDecrypt(projectKey, process.env.ENCRYPTION_ROOT_KEY!);

      return auditLogs.map((audit) => ({
        ...audit,
        content: aesDecrypt(audit.content, decryptedKey),
      }));
    }),
};
