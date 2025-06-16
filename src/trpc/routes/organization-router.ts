import { z } from "zod";
import { privateProcedure, router } from "../trpc";
import { getDbClient } from "@/lib/db/models";
import { TRPCError } from "@trpc/server";

export const organizationRouter = router({
  get: privateProcedure.query(async ({ ctx }) => {
    const { user } = ctx;
    const { id: githubId } = user;
    const db = await getDbClient();

    const profileId = (await db.profile.getByField({ github_id: String(githubId) }))?.id;

    if (!profileId) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    }

    return (await db.organization.get(profileId)).sort((a, b) => {
      if (a.role === b.role) return 0;
      if (a.role === "admin") return -1;
      if (b.role === "admin") return 1;
      if (a.role === "editor") return -1;
      if (b.role === "editor") return 1;
      return 0;
    });
  }),
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
  update: privateProcedure
    .input(z.object({ orgId: z.number(), name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;
      const { id: githubId } = user;
      const { orgId, name } = input;

      const db = await getDbClient();

      const profileId = (await db.profile.getByField({ github_id: String(githubId) }))?.id;

      if (!profileId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
      }

      const isOrgAdmin = await db.organization.isOrgAdmin(profileId, orgId);

      if (!isOrgAdmin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only organization admin can delete organization",
        });
      }

      const updatedOrg = await db.organization.update(orgId, name);

      if (!updatedOrg) {
        throw new TRPCError({ code: "CONFLICT", message: "Organization name must be unique" });
      }

      return updatedOrg;
    }),
  delete: privateProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
    const { user } = ctx;
    const { id: githubId } = user;
    const orgId = input;

    const db = await getDbClient();

    const profileId = (await db.profile.getByField({ github_id: String(githubId) }))?.id;

    if (!profileId) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    }

    const isOrgAdmin = await db.organization.isOrgAdmin(profileId, orgId);

    if (!isOrgAdmin) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Only organization admin can delete organization",
      });
    }

    const deletedOrg = await db.organization.delete(orgId);

    if (!deletedOrg) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });
    }

    return deletedOrg;
  }),
  leave: privateProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
    const { user } = ctx;
    const { id: githubId } = user;
    const orgId = input;

    const db = await getDbClient();

    const profileId = (await db.profile.getByField({ github_id: String(githubId) }))?.id;

    if (!profileId) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
    }

    const isOrgAdmin = await db.organization.isOrgAdmin(profileId, orgId);

    if (isOrgAdmin) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Organization admin cannot leave organization",
      });
    }

    const leftOrg = await db.organization.leave(profileId, orgId);

    if (!leftOrg) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });
    }

    return leftOrg;
  }),
});
