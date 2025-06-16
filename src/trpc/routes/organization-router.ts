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
  addMember: privateProcedure
    .input(
      z.object({ username: z.string(), role: z.enum(["viewer", "editor"]), orgId: z.number() })
    )
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;
      const { id: githubId } = user;
      const { username, orgId, role } = input;

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

      const member = await db.profile.getByField({ username });

      if (!member) {
        throw new TRPCError({ code: "NOT_FOUND", message: `User not found username:${username}` });
      }

      return await db.organization.addMember(member.id, orgId, role);
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
  updateMemberRole: privateProcedure
    .input(
      z.object({ username: z.string(), role: z.enum(["viewer", "editor"]), orgId: z.number() })
    )
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;
      const { id: githubId } = user;
      const { username, orgId, role } = input;

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

      const member = await db.profile.getByField({ username });

      if (!member) {
        throw new TRPCError({ code: "NOT_FOUND", message: `User not found username:${username}` });
      }

      return await db.organization.updateMemberRole(member.id, orgId, role);
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
  deleteMember: privateProcedure
    .input(z.object({ username: z.string(), orgId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;
      const { id: githubId } = user;
      const { username, orgId } = input;

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

      const member = await db.profile.getByField({ username });

      if (!member) {
        throw new TRPCError({ code: "NOT_FOUND", message: `User not found username:${username}` });
      }

      return await db.organization.deleteMember(member.id, orgId);
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
