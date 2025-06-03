import {
  CreateProject,
  EnvironmentTable,
  EnvironmentName,
  GithubUser,
  GithubUserNoId,
  Profile,
  ProjectTable,
  ProjectKeyTable,
  ServerSecret,
  SecretTable,
  SecretVersionTable,
  UpdateProjectName,
  TemplateTable,
  EnvironmentSecret,
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
  getByProfile: (githubId: number) => Promise<ProjectTable[]>;
  getById: (projectId: number, githubId: number) => Promise<ProjectTable>;
  getKey: (projectId: number, githubId: number) => Promise<ProjectKeyTable | null>;
  create: (projectData: CreateProject, encryptionKey: string) => Promise<ProjectTable>;
  addProject: (projectData: CreateProject) => Promise<ProjectTable>;
  addKey: (projectId: number, encryptedKey: string) => Promise<ProjectKeyTable>;
  updateName: (project: UpdateProjectName) => Promise<ProjectTable | null>;
  delete: (projectId: number) => Promise<ProjectTable>;
};

export type TEnvironmentModel = {
  create: (projectId: number, environment: EnvironmentName) => Promise<EnvironmentTable>;
};

export type TSecretModel = {
  getById: (secretId: number) => Promise<EnvironmentSecret>;
  create: (
    projectId: number,
    environment: EnvironmentName,
    path: string,
    content: string
  ) => Promise<number | null>;
  update: (secretId: number, content: string) => Promise<EnvironmentSecret | null>;
};

export type TTemplateModel = {
  getPublicById: (templateId: number) => Promise<TemplateTable | null>;
  getPublic: () => Promise<TemplateTable[]>;
};

export type TDbClient = {
  profile: TProfileModel;
  project: TProjectModel;
  environment: TEnvironmentModel;
  secret: TSecretModel;
  template: TTemplateModel;
};
