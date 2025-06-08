import { EnvironmentName, GithubRepo, UpdateProjectName } from "./types";

export type TGihubHelpers = {
  getPaths: (
    owner: string,
    repo: string,
    accessToken: string,
    projectId: number,
    environment: EnvironmentName
  ) => Promise<string[]>;
  getRepos: (accessToken: string, githubId: number) => Promise<GithubRepo[]>;
  updateProjectNames: (repos: GithubRepo[], githubId: number) => Promise<UpdateProjectName[]>;
  getUpdatedRepos: (
    repos: GithubRepo[],
    githubId: number
  ) => Promise<
    {
      repo_id: number;
      newName: string | undefined;
      newFullName: string | undefined;
    }[]
  >;
};

export type TApiHelpers = {
  fetchAllPages: <T>(
    url: string,
    headers: {
      Authorization: string;
      Accept: string;
    }
  ) => Promise<T[]>;
};

export type THelpersClient = {
  github: TGihubHelpers;
  api: TApiHelpers;
};
