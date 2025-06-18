import { getDbClient } from "@/lib/db/models";
import { privateProcedure, router } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const projectRouter = router({
  get: privateProcedure.query(async ({ ctx }) => {
    const { user } = ctx;
    const { id: githubId } = user;

    const db = await getDbClient();

    return await db.project.getByProfile(githubId);
  }),
  getById: privateProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const { projectId } = input;
      const { user } = ctx;
      const { id: githubId } = user;

      const db = await getDbClient();
      const project = await db.project.getById(projectId, githubId);

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Project with id ${projectId} not found or access denied`,
        });
      }

      return project;
    }),
  create: privateProcedure
    .input(
      z.object({
        repo_id: z.number(),
        name: z.string(),
        full_name: z.string(),
        owner: z.string(),
        url: z.string(),
        isPrivate: z.boolean(),
        orgId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { repo_id, name, full_name, owner, url, isPrivate, orgId } = input;

      const { user } = ctx;
      const { id: github_id } = user;

      const db = await getDbClient();

      const profile = await db.profile.getByField({ github_id: github_id.toString() });

      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const project = await db.project.create(
        { profile_id: profile.id, repo_id, name, full_name, owner, url, private: isPrivate },
        process.env.ENCRYPTION_ROOT_KEY!,
        orgId
      );

      return project;
    }),
  delete: privateProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;
      const { id: githubId } = user;
      const { projectId } = input;
      const db = await getDbClient();

      if (!(await db.project.hasWriteAccess(String(githubId), projectId))) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You lack the permission required to perform this action",
        });
      }

      return await db.project.delete(projectId);
    }),
});
