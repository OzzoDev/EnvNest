import { z } from "zod";
import { privateProcedure, router } from "../trpc";
import axios from "axios";

export const githubRouter = router({
  getPaths: privateProcedure
    .input(z.object({ owner: z.string(), repo: z.string() }))
    .query(async ({ input }) => {
      const { owner, repo } = input;

      try {
        const repoRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}`);

        const defaultBranch = repoRes.data.default_branch;

        const branchRes = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}/branches/${defaultBranch}`
        );

        const treeSha = branchRes.data.commit.commit.tree.sha;

        const treeRes = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`
        );

        const tree: { type: string; path: string }[] = treeRes.data.tree;

        const folders = tree.filter((item) => item.type === "tree").map((item) => `/${item.path}`);

        return ["./", ...folders];
      } catch (err) {
        console.error("Error fetching GitHub tree:", err);
        return [];
      }
    }),
});
