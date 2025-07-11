import { z } from "zod";
import { privateProcedure, router } from "../trpc";
import { getDbClient } from "@/lib/db/models";
import { aesDecrypt, aesEncrypt } from "@/lib/aes-helpers";
import { TRPCError } from "@trpc/server";
import { EnvironmentName } from "@/types/types";

export const secretRouter = router({
  get: privateProcedure
    .input(z.object({ projectId: z.number(), secretId: z.number().nullable() }))
    .query(async ({ input, ctx }) => {
      const { user } = ctx;
      const { id: githubId } = user;
      const { projectId, secretId } = input;

      const db = await getDbClient();

      const projectKey = (await db.project.getKey(projectId, githubId))?.encrypted_key;

      if (!projectKey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Encryption key not found",
        });
      }

      const decryptedKey = aesDecrypt(projectKey, process.env.ENCRYPTION_ROOT_KEY!);

      let safeSecretId = secretId;

      const profileId = (await db.profile.getByField({ github_id: String(githubId) }))?.id;

      if (!profileId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profile not found",
        });
      }

      if (!secretId) {
        safeSecretId =
          (await db.secretActive.getByProjectAndProfile(profileId, projectId))?.secret_id ?? null;
      } else {
        await db.secretActive.upsert(String(githubId), projectId, secretId);
      }

      if (!safeSecretId) {
        return null;
      }

      const secret = await db.secret.getById(safeSecretId);

      if (!secret) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Secret not found" });
      }

      const decryptedContent = aesDecrypt(secret.content, decryptedKey);

      return { ...secret, content: decryptedContent };
    }),
  getAllAsPathAndId: privateProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const { projectId } = input;

      const db = await getDbClient();

      const environments = (await db.environment.getByProject(projectId)).map((env) => env.name);
      const secrets = await db.secret.getByProject(projectId);

      const result = environments.reduce<Record<string, { id: number; path: string }[]>>(
        (acc, env) => {
          const paths = secrets
            .filter((secret) => secret.environment === env)
            .map((secret) => ({
              id: secret.id,
              path: secret.path,
            }));

          if (paths && paths.length > 0) {
            acc[env] = paths;
          }

          return acc;
        },
        {}
      );

      return result;
    }),
  getHistory: privateProcedure.query(async ({ ctx }) => {
    const { user } = ctx;
    const { id: githubId } = user;

    const db = await getDbClient();

    const logs = await db.secretHistory.get(String(githubId));

    return logs;
  }),
  saveToHistory: privateProcedure
    .input(z.object({ secretId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const { secretId } = input;
      const { user } = ctx;
      const { id: githubId } = user;

      const db = await getDbClient();

      return db.secretHistory.create(String(githubId), secretId);
    }),
  create: privateProcedure
    .input(
      z.object({
        projectId: z.number(),
        environment: z.string(),
        path: z.string(),
        templateId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;
      const { id: githubId } = user;
      const { projectId, environment, path, templateId } = input;

      const db = await getDbClient();

      if (!(await db.project.hasWriteAccess(String(githubId), projectId))) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You lack the permission required to perform this action",
        });
      }

      const profileId = (await db.profile.getByField({ github_id: String(githubId) }))?.id;

      if (!profileId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profile not found",
        });
      }

      const project = await db.project.getById(projectId, githubId);

      const projectKey = (await db.project.getKey(projectId, githubId))?.encrypted_key;

      if (!project || !projectKey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const decryptedKey = aesDecrypt(projectKey, process.env.ENCRYPTION_ROOT_KEY!);

      const template = templateId
        ? (await db.template.getOwnAndPublicById(profileId, templateId))?.template || ""
        : "";

      const encryptedContent = aesEncrypt(template, decryptedKey);

      const createdSecret = await db.secret.create(
        projectId,
        environment as EnvironmentName,
        path,
        encryptedContent
      );

      if (!createdSecret) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error creating secret. Please try again",
        });
      }

      await db.auditLog.create(
        String(githubId),
        createdSecret.id,
        createdSecret.secret_version_id,
        `Created secret for ${project.full_name}`,
        { type: "CREATE" }
      );

      await db.secretActive.upsert(String(githubId), projectId, createdSecret.id);

      return createdSecret;
    }),
  update: privateProcedure
    .input(
      z.object({
        secretId: z.number(),
        projectId: z.number(),
        content: z.string(),
        type: z.string().optional(),
        updateMessage: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;
      const { id: githubId } = user;
      const { secretId, projectId, content, type = "UPDATE", updateMessage } = input;

      const db = await getDbClient();

      if (!(await db.project.hasWriteAccess(String(githubId), projectId))) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You lack the permission required to perform this action",
        });
      }

      const projectKey = (await db.project.getKey(projectId, githubId))?.encrypted_key;

      if (!projectKey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Encryption key not found",
        });
      }

      const decryptedKey = aesDecrypt(projectKey, process.env.ENCRYPTION_ROOT_KEY!);

      const encryptedContent = aesEncrypt(content, decryptedKey);

      const updatedSecret = await db.secret.update(secretId, encryptedContent);

      if (!updatedSecret) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error updating secret. Please try again",
        });
      }

      await db.auditLog.create(
        String(githubId),
        updatedSecret.id,
        updatedSecret.secret_version_id,
        updateMessage,
        { type }
      );

      const decryptedUpdatedSecret = aesDecrypt(updatedSecret?.content, decryptedKey);

      return { ...updatedSecret, content: decryptedUpdatedSecret };
    }),
  delete: privateProcedure
    .input(
      z.object({
        secretId: z.number().nullable(),
        projectId: z.number().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;
      const { id: githubId } = user;
      const { secretId, projectId } = input;

      if (!secretId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "SecretId must be provided",
        });
      }

      if (!projectId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ProjectId must be provided",
        });
      }

      const db = await getDbClient();

      if (!(await db.project.hasWriteAccess(String(githubId), projectId))) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You lack the permission required to perform this action",
        });
      }

      return await db.secret.delete(secretId);
    }),
});
