import { getDbClient } from "@/lib/db/models";
import { privateProcedure, router } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { aesDecrypt } from "../../lib/aes-helpers";
import { ProjectSecret } from "@/types/types";

export const projectRouter = router({
  getAllProjects: privateProcedure.query(async ({ ctx }) => {
    const { user } = ctx;
    const { id: github_id } = user;

    try {
      const db = await getDbClient();

      return await db.project.getByProfile(github_id);
    } catch (err) {
      console.log(err);
    }
  }),
  getProjectSecret: privateProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const { projectId } = input;

      console.log("ProejctId on the server:", projectId);

      if (!projectId) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const db = await getDbClient();

      const projectSecret = await db.project.getById(projectId);

      const encryptedKey = projectSecret.encrypted_key;

      if (!encryptedKey) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Encryption key not found" });
      }

      const decryptedKey = aesDecrypt(encryptedKey, process.env.ENCRYPTION_ROOT_KEY!);

      const content = projectSecret.content;

      if (content === null) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Content not found" });
      }

      const decryptedContent = aesDecrypt(content, decryptedKey);

      const decrypted = { ...projectSecret, content: decryptedContent };

      const { encrypted_key, ...clientSideData } = decrypted;

      console.log(clientSideData);

      return clientSideData as ProjectSecret;
    }),
  createProject: privateProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        full_name: z.string(),
        owner: z.string(),
        url: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { name, id, full_name, owner, url } = input;

      const { user } = ctx;
      const { id: github_id } = user;

      const db = await getDbClient();

      const profile = await db.profile.getByField({ github_id: github_id.toString() });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const project = await db.project.create(
        { profile_id: profile.id, repo_id: id, name, full_name, owner, url },
        process.env.ENCRYPTION_ROOT_KEY!
      );

      return project;
    }),
});
