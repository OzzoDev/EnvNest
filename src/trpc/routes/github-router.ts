import { z } from "zod";
import { privateProcedure, router } from "../trpc";
import { EnvironmentName } from "@/types/types";
import { gethelpersClient } from "@/lib/db/helpers";
import { TRPCError } from "@trpc/server";

export const githubRouter = router({
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

      const helpers = await gethelpersClient();

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
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const helpers = await gethelpersClient();

    return await helpers.github.getRepos(accessToken, githubId);
  }),
});
