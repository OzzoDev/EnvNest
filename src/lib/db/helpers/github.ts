import { EnvironmentName } from "@/types/types";
import secretModel from "../models/secret";
import axios from "axios";

const github = {
  getPaths: async (
    owner: string,
    repo: string,
    accessToken: string,
    projectId: number,
    environment: EnvironmentName
  ): Promise<string[]> => {
    const branchesToTry = ["main", "master"];

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
          await secretModel.getByEnvironment(projectId, environment as EnvironmentName)
        ).map((secrets) => secrets.path);

        return paths.filter((path) => !occupiedPaths.includes(path.path)).map((path) => path.path);
      } catch {}
    }

    return [];
  },
};

export default github;
