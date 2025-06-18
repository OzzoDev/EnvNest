import { z } from "zod";
import { privateProcedure, router } from "../trpc";
import { getHelpersClient } from "@/lib/db/helpers";
import { ENVIRONMENTS } from "@/config";
import { getDbClient } from "@/lib/db/models";
import { TRPCError } from "@trpc/server";

export const environmentRouter = router({
  getAvailable: privateProcedure
    .input(z.object({ repo: z.string(), projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const { accessToken } = ctx.session;
      const { repo, projectId } = input;

      const db = await getDbClient();

      const owner = await db.project.getProjectOwner(projectId);

      if (!owner) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project owner not found" });
      }

      const helpers = await getHelpersClient();

      return (
        await Promise.all(
          ENVIRONMENTS.map(async (env) => {
            const hasUnusedPaths =
              (
                await helpers.github.getPaths(
                  owner.username,
                  repo,
                  accessToken!,
                  projectId,
                  env.value
                )
              ).length > 0;

            return hasUnusedPaths ? env : null;
          })
        )
      ).filter(Boolean);
    }),
});
