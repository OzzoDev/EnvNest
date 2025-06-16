import { z } from "zod";
import { privateProcedure, router } from "../trpc";
import { getDbClient } from "@/lib/db/models";
import { TRPCError } from "@trpc/server";

export const organizationRouter = router({
  create: privateProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    const { user } = ctx;
    const { id: githubId } = user;
    const orgName = input;

    const db = await getDbClient();

    const profileId = (await db.profile.getByField({ github_id: String(githubId) }))?.id;

    if (!profileId) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    }

    const createdOrg = await db.organization.create(profileId, orgName);

    if (!createdOrg) {
      throw new TRPCError({ code: "CONFLICT", message: "Organization name must be unique" });
    }

    return createdOrg;
  }),
});
