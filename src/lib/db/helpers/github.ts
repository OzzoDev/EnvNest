import { EnvironmentName, GithubOrg, GithubRepo, UpdateProjectName } from "@/types/types";
import secretModel from "../models/secret";
import axios from "axios";
import apiHelpers from "./api";
import { getDbClient } from "../models";
import { getCache, setCache } from "@/lib/redis";

const github = {
  getPaths: async (
    githubId: string,
    owner: string,
    repo: string,
    accessToken: string,
    projectId: number,
    environment: EnvironmentName
  ): Promise<string[]> => {
    const branchesToTry = ["main", "master"];

    for (const branch of branchesToTry) {
      const cacheKey = `${githubId}:paths:${owner}:${repo}:${branch}:${projectId}:${environment}`;

      const cached = await getCache<string[]>(cacheKey);

      if (cached) {
        return cached;
      }

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

        const filteredPaths = paths
          .filter((path) => !occupiedPaths.includes(path.path))
          .map((path) => path.path);

        await setCache<string[]>(cacheKey, filteredPaths, 60);

        return filteredPaths;
      } catch {}
    }

    return [];
  },
  getRepos: async (accessToken: string, githubId: number): Promise<GithubRepo[]> => {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    };

    const cacheKeyUserRepos = `user:repos:${accessToken}`;
    const cacheKeyUserOrgs = `user:orgs:${accessToken}`;
    const cacheKeyUserInfo = `user:info:${accessToken}`;

    let userRepos = await getCache<GithubRepo[]>(cacheKeyUserRepos);
    if (!userRepos) {
      userRepos = await apiHelpers.fetchAllPages("https://api.github.com/user/repos", headers);
      await setCache(cacheKeyUserRepos, userRepos, 60);
    }

    let orgs = (await getCache<GithubOrg[]>(cacheKeyUserOrgs)) ?? [];
    if (!orgs || orgs.length === 0) {
      const orgResponse = await axios.get("https://api.github.com/user/orgs", {
        headers,
      });
      orgs = orgResponse.data;
      await setCache(cacheKeyUserOrgs, orgs, 60);
    }

    console.log("Orgs: ", orgs);

    const orgReposResults = await Promise.all(
      orgs.map(async (org: GithubOrg) => {
        const cacheKeyOrgRepos = `org:repos:${org.login}:${accessToken}`;
        let orgRepos = await getCache<GithubRepo[]>(cacheKeyOrgRepos);
        if (!orgRepos) {
          orgRepos = await apiHelpers.fetchAllPages(
            `https://api.github.com/orgs/${org.login}/repos`,
            headers
          );
          await setCache(cacheKeyOrgRepos, orgRepos, 60);
        }
        return orgRepos;
      })
    );
    const orgRepos = orgReposResults.flat();

    const allRepos: GithubRepo[] = [...userRepos, ...orgRepos];

    let sessionUser = await getCache<{ login: string }>(cacheKeyUserInfo);
    if (!sessionUser) {
      const sessionUserResponse = await axios.get("https://api.github.com/user", { headers });
      sessionUser = sessionUserResponse.data;
      await setCache(cacheKeyUserInfo, sessionUser, 60);
    }

    const yourLogin = sessionUser?.login;
    const orgLogins = orgs.map((org) => org.login);

    const filteredRepos: GithubRepo[] = allRepos.filter(
      (repo: GithubRepo) =>
        (repo.owner?.login === yourLogin || orgLogins.includes(repo.owner?.login ?? "")) &&
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

    const seenIds = new Set<number>();
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

        return repoVisibility !== projectVisibility;
      })
      .map((pro) => ({
        id: pro.id,
        private: repos.find((rep) => rep.id === pro.repo_id)?.private ?? pro.private,
      }));

    await Promise.all(
      unsyncedProjects.map((pro) => db.project.syncProjectVisibility(pro.id, pro.private))
    );
  },
};

export default github;
