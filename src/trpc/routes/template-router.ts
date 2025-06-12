import { getDbClient } from "@/lib/db/models";
import { privateProcedure, router } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const templateRouter = router({
  getOwnAndPublic: privateProcedure.query(async ({ ctx }) => {
    const { user } = ctx;
    const { id: githubId } = user;

    const db = await getDbClient();

    const profileId = (await db.profile.getByField({ github_id: String(githubId) }))?.id;

    if (!profileId) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    }

    return db.template.getOwnAndPublic(profileId);
  }),
  create: privateProcedure
    .input(
      z.object({
        name: z.string(),
        template: z.string(),
        visibility: z.enum(["private", "organization"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;
      const { id: githubId } = user;
      const { name, template, visibility } = input;

      const db = await getDbClient();

      const profileId = (await db.profile.getByField({ github_id: String(githubId) }))?.id;

      if (!profileId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      const createdTemplate = await db.template.create(profileId, name, template, visibility);

      if (!createdTemplate) {
        throw new TRPCError({ code: "CONFLICT", message: "Template name must be unique" });
      }

      return createdTemplate;
    }),
});
