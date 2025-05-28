import {
  CreateProject,
  Environment,
  EnvironmentName,
  GithubUser,
  GithubUserNoId,
  Profile,
  Project,
  ProjectKey,
  UpdateProjectName,
} from "./types";

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
  getByProfile: (githubId: number) => Promise<Project[]>;
  create: (projectData: CreateProject, encryptionKey: string) => Promise<Project>;
  addProject: (projectData: CreateProject) => Promise<Project>;
  addKey: (projectId: number, encryptedKey: string) => Promise<ProjectKey>;
  updateName: (project: UpdateProjectName) => Promise<Project | null>;
};

export type TEnvironmentModel = {
  create: (projectId: number, environment: EnvironmentName) => Promise<Environment>;
};

export type TDbClient = {
  profile: TProfileModel;
  project: TProjectModel;
  environment: TEnvironmentModel;
};
