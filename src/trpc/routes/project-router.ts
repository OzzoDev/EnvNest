import { getDbClient } from "@/lib/db/models";
import { privateProcedure, router } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const projectRouter = router({
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
