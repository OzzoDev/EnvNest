import axios from "axios";
import { fetchAllPages } from "../api";
import { GithubRepo, GithubOrg, UpdateProjectName } from "@/types/types";
import { getDbClient } from "@/lib/db/models";

export const getRepos = async (accessToken: string, githubId: number): Promise<GithubRepo[]> => {
  try {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    };

    const userRepos = await fetchAllPages("https://api.github.com/user/repos", headers);

    const orgResponse = await axios.get("https://api.github.com/user/orgs", { headers });
    const orgs = orgResponse.data;

    const orgReposResults = await Promise.all(
      orgs.map((org: GithubOrg) =>
        fetchAllPages(`https://api.github.com/orgs/${org.login}/repos`, headers)
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

    await updateProjectNames(uniqueRepos, githubId);

    return uniqueRepos;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const updateProjectNames = async (repos: GithubRepo[], githubId: number) => {
  const updates = await getUpdatedRepos(repos, githubId);

  const db = await getDbClient();

  const updatePromises = updates.map((update) => {
    const updateData: UpdateProjectName = {
      repo_id: update.repo_id,
      name: update.newName!,
      full_name: update.newFullName!,
    };

    return db.project.updateName(updateData);
  });

  return await Promise.all(updatePromises);
};

export const getUpdatedRepos = async (repos: GithubRepo[], githubId: number) => {
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
};
