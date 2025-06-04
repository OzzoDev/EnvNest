import { z } from "zod";
import { privateProcedure, router } from "../trpc";
import axios from "axios";
import { getDbClient } from "@/lib/db/models";
import { EnvironmentName } from "@/types/types";

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

      const branchesToTry = ["main", "master"];

      const db = await getDbClient();

      for (const branch of branchesToTry) {
        try {
          const res = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
            {
              headers: {
                Authorization: `token ${accessToken}`,
                Accept: "application/vnd.github.v3+json",
              },
            }
          );

          const tree: { type: string; path: string }[] = res.data.tree;

          const folders = tree
            .filter((item) => item.type === "tree")
            .map((item) => ({ path: `/${item.path}` }));

          const paths = [{ path: "./" }, ...folders];

          const occupiedPaths = (
            await db.secret.getByEnvironment(projectId, environment as EnvironmentName)
          ).map((secrets) => secrets.path);

          return paths.filter((path) => !occupiedPaths.includes(path.path));
        } catch {}
      }

      return [];
    }),
});
