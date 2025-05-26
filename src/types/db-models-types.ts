import { CreateProject, GithubUser, GithubUserNoId, Profile, Project, ProjectKey } from "./types";

export type TProfileModel = {
  getAll: () => Promise<Profile[]>;
  getByField<K extends keyof Profile>(where: Record<K, Profile[K]>): Promise<Profile | undefined>;
  create: (user: GithubUser) => Promise<Profile>;
  update<K extends keyof Profile>(
    user: GithubUserNoId,
    whereKey: K,
    whereValue: Profile[K]
  ): Promise<Profile>;
  upsert<K extends keyof Profile>(
    where: Record<K, Profile[K]>,
    update: GithubUserNoId,
    create: GithubUser
  ): Promise<Profile>;
};

export type TProjectModel = {
  create: (projectData: CreateProject, encryptionKey: string) => Promise<Project>;
  addName: (projectData: CreateProject) => Promise<Project>;
  addKey: (projectId: number, encryptedKey: string) => Promise<ProjectKey>;
};

export type TDbClient = {
  profile: TProfileModel;
  project: TProjectModel;
};
