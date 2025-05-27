import axios from "axios";
import { fetchAllPages } from "../api";
import { GithubRepo, GithubOrg } from "@/types/types";

export const getRepos = async (accessToken: string): Promise<GithubRepo[]> => {
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

    return uniqueRepos;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
