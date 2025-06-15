import { z } from "zod";
import { privateProcedure, router } from "../trpc";
import { getDbClient } from "@/lib/db/models";
import { TRPCError } from "@trpc/server";

export const collaboratorRouter = router({
  create: privateProcedure
    .input(
      z.object({ username: z.string(), project: z.string(), role: z.enum(["viewer", "editor"]) })
    )
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;
      const { id: githubId } = user;
      const { username, project, role } = input;

      const db = await getDbClient();

      const projectId = (await db.project.getByProfile(githubId)).find(
        (pro) => pro.full_name === project
      )?.id;

      if (!projectId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      const collaboratorId = (await db.profile.getByField({ username }))?.id;

      if (!collaboratorId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return await db.collaborator.create(collaboratorId, projectId, role);
    }),
});
