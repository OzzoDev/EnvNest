import { z } from "zod";
import { privateProcedure, router } from "../trpc";
import { getDbClient } from "@/lib/db/models";
import { aesDecrypt, aesEncrypt } from "@/lib/aes-helpers";
import { TRPCError } from "@trpc/server";
import { EnvironmentName } from "@/types/types";

export const secretRouter = router({
  create: privateProcedure
    .input(
      z.object({
        projectId: z.number(),
        environment: z.string(),
        path: z.string(),
        templateId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { projectId, environment, path, templateId } = input;

      const db = await getDbClient();

      const projectKey = (await db.project.getKey(projectId))?.encrypted_key;

      if (!projectKey) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const decryptedKey = aesDecrypt(projectKey, process.env.ENCRYPTION_ROOT_KEY!);

      const template = templateId
        ? (await db.template.getPublicById(templateId))?.template || ""
        : "";

      const encryptedContent = aesEncrypt(template, decryptedKey);

      return await db.secret.create(
        projectId,
        environment as EnvironmentName,
        path,
        encryptedContent
      );
    }),
  updateVersion: privateProcedure
    .input(z.object({ secretId: z.number(), projectId: z.number(), content: z.string() }))
    .mutation(async ({ input }) => {
      const { secretId, projectId, content } = input;

      const db = await getDbClient();

      const projectKey = (await db.project.getKey(projectId))?.encrypted_key;

      if (!projectKey) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const decryptedKey = aesDecrypt(projectKey, process.env.ENCRYPTION_ROOT_KEY!);

      const encryptedContent = aesEncrypt(content, decryptedKey);

      return db.secret.updateVersion(secretId, encryptedContent);
    }),
});
