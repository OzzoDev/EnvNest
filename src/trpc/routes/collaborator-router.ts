import { z } from "zod";
import { privateProcedure, router } from "../trpc";
import { getDbClient } from "@/lib/db/models";
import { TRPCError } from "@trpc/server";

export const collaboratorRouter = router({
  get: privateProcedure.query(async ({ ctx }) => {
    const { user } = ctx;
    const { id: githubId } = user;

    const db = await getDbClient();

    const projectsIds = (await db.project.getByProfile(githubId)).map((project) => project.id);

    return (
      await Promise.all(
        projectsIds.map((projectId) => db.collaborator.getCollaboratorsInProject(projectId))
      )
    ).flat();
  }),
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

      const profileId = (await db.profile.getByField({ github_id: String(githubId) }))?.id;

      if (!profileId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      if (collaboratorId === profileId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot add yourself as a collaborator",
        });
      }

      const isNew = !(await db.collaborator.getByProfileId(profileId, projectId));

      if (!isNew) {
        throw new TRPCError({ code: "CONFLICT", message: "User is already collaborator" });
      }

      return await db.collaborator.create(collaboratorId, projectId, role);
    }),
});
