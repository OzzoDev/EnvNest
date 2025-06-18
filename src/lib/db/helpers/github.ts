import { EnvironmentName, GithubOrg, GithubRepo, UpdateProjectName } from "@/types/types";
import secretModel from "../models/secret";
import axios from "axios";
import apiHelpers from "./api";
import { getDbClient } from "../models";

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
  getRepos: async (accessToken: string, githubId: number): Promise<GithubRepo[]> => {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    };

    const userRepos = await apiHelpers.fetchAllPages("https://api.github.com/user/repos", headers);

    const orgResponse = await axios.get("https://api.github.com/user/orgs", { headers });
    const orgs = orgResponse.data;

    const orgReposResults = await Promise.all(
      orgs.map((org: GithubOrg) =>
        apiHelpers.fetchAllPages(`https://api.github.com/orgs/${org.login}/repos`, headers)
      )
    );

    const orgRepos = orgReposResults.flat();

    const allRepos: GithubRepo[] = [...userRepos, ...orgRepos];

    const sessionUser = await axios.get("https://api.github.com/user", { headers });
    const yourLogin = sessionUser.data.login;
    const orgLogins = orgs.map((org: GithubOrg) => org.login);

    const filteredRepos: GithubRepo[] = allRepos.filter(
      (repo: GithubRepo) =>
        (repo.owner?.login === yourLogin || orgLogins.includes(repo.owner?.login)) &&
        !repo.archived &&
        !repo.disabled &&
        !repo.fork
    );

    const cleandRepos: GithubRepo[] = filteredRepos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      owner: { login: repo.owner.login, type: repo.owner.type },
      fork: repo.fork,
      disabled: repo.disabled,
      archived: repo.archived,
      private: repo.private,
      html_url: repo.html_url,
      created_at: repo.created_at,
    }));

    const seenIds = new Set();

    const uniqueRepos: GithubRepo[] = cleandRepos.filter((repo) => {
      if (seenIds.has(repo.id)) {
        return false;
      }
      seenIds.add(repo.id);
      return true;
    });

    await github.updateProjectNames(uniqueRepos, githubId);

    await github.syncProjectVisibility(uniqueRepos, githubId);

    return uniqueRepos;
  },
  updateProjectNames: async (
    repos: GithubRepo[],
    githubId: number
  ): Promise<UpdateProjectName[]> => {
    const updates = await github.getUpdatedRepos(repos, githubId);

    const db = await getDbClient();

    const updatePromises = updates.map((update) => {
      const updateData: UpdateProjectName = {
        repo_id: update.repo_id,
        name: update.newName!,
        full_name: update.newFullName!,
      };

      return db.project.updateName(updateData);
    });

    return (await Promise.all(updatePromises)) as UpdateProjectName[];
  },
  getUpdatedRepos: async (
    repos: GithubRepo[],
    githubId: number
  ): Promise<
    {
      repo_id: number;
      newName: string | undefined;
      newFullName: string | undefined;
    }[]
  > => {
    const db = await getDbClient();

    const existingRepos = await db.project.getByProfile(githubId);

    return existingRepos
      .filter((exRepo) =>
        repos.some((repo) => repo.id === exRepo.repo_id && exRepo.full_name !== repo.full_name)
      )
      .map((repo) => ({
        repo_id: repo.repo_id,
        newName: repos.find((r) => r.id === repo.repo_id)?.name,
        newFullName: repos.find((r) => r.id === repo.repo_id)?.full_name,
      }));
  },
  syncProjectVisibility: async (repos: GithubRepo[], githubId: number) => {
    const db = await getDbClient();

    const projects = await db.project.getByProfile(githubId);

    const unsyncedProjects = projects
      .filter((pro) => {
        const repoVisibility = repos.find((rep) => rep.id === pro.repo_id)?.private;
        const projectVisibility = pro.private;

        console.log(repoVisibility, projectVisibility);

        return repoVisibility !== projectVisibility;
      })
      .map((pro) => ({ id: pro.id, private: !!pro.private }));

    console.log(unsyncedProjects);

    await Promise.all([
      unsyncedProjects.map((pro) => db.project.syncProjectVisibility(pro.id, !pro.private)),
    ]);
  },
};

export default github;
