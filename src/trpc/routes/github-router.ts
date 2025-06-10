import { z } from "zod";
import { privateProcedure, router } from "../trpc";
import { EnvironmentName } from "@/types/types";
import { getHelpersClient } from "@/lib/db/helpers";
import { TRPCError } from "@trpc/server";
import { getDbClient } from "@/lib/db/models";

export const githubRouter = router({
  getAvailableRepos: privateProcedure.query(async ({ ctx }) => {
    const { user } = ctx;
    const { id: githubId } = user;
    const { session } = ctx;
    const { accessToken } = session;

    if (!accessToken) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized. Please log in and try again.",
      });
    }

    const db = await getDbClient();

    const helpers = await getHelpersClient();

    const repos = await helpers.github.getRepos(accessToken!, githubId);

    const projects = await db.project.getByProfile(githubId);

    return repos.filter((repo) => !projects?.some((pro) => pro.repo_id === repo.id));
  }),
  getPaths: privateProcedure
    .input(
      z.object({
        owner: z.string(),
        repo: z.string(),
        projectId: z.number(),
        environment: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { owner, repo, projectId, environment } = input;
      const { accessToken } = ctx.session;

      const helpers = await getHelpersClient();

      return await helpers.github.getPaths(
        owner,
        repo,
        accessToken!,
        projectId,
        environment as EnvironmentName
      );
    }),
  getRepos: privateProcedure.query(async ({ ctx }) => {
    const { user, session } = ctx;
    const { accessToken } = session;
    const { id: githubId } = user;

    if (!accessToken) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized. Please log in and try again.",
      });
    }

    const helpers = await getHelpersClient();

    return await helpers.github.getRepos(accessToken, githubId);
  }),
});
