import {
  CreateProject,
  EnvironmentTable,
  EnvironmentName,
  GithubUser,
  GithubUserNoId,
  Profile,
  ProjectTable,
  ProjectKeyTable,
  SecretTable,
  UpdateProjectName,
  TemplateTable,
  EnvironmentSecret,
  AuditLogTable,
  SecretActiveTable,
  AuditLogWithUser,
  SecretHistoryTable,
  SecretHistory,
  TemplateVisibility,
} from "./types";

export type TProfileModel = {
  get: () => Promise<Profile[]>;
  getByField<K extends keyof Profile>(where: Record<K, Profile[K]>): Promise<Profile | undefined>;
  searchOne: (username: string) => Promise<Profile | null>;
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
  getByProject: (projectId: number) => Promise<EnvironmentTable[]>;
  create: (projectId: number, environment: EnvironmentName) => Promise<EnvironmentTable>;
};

export type TSecretModel = {
  getById: (secretId: number) => Promise<EnvironmentSecret>;
  getByProject: (projectId: number) => Promise<EnvironmentSecret[]>;
  getByEnvironment: (
    projectId: number,
    environment: EnvironmentName
  ) => Promise<EnvironmentSecret[]>;
  create: (
    projectId: number,
    environment: EnvironmentName,
    path: string,
    content: string
  ) => Promise<EnvironmentSecret | null>;
  update: (secretId: number, content: string) => Promise<EnvironmentSecret | null>;
  delete: (secretId: number) => Promise<SecretTable>;
};

export type TTemplateModel = {
  getOwnAndPublicById: (profileId: number, templateId: number) => Promise<TemplateTable | null>;
  getOwnAndPublic: (profileId: number) => Promise<TemplateTable[]>;
  create: (
    profileId: number,
    name: string,
    template: string,
    visibility: TemplateVisibility
  ) => Promise<TemplateTable | null>;
  update: (
    profileId: number,
    templateId: number,
    name?: string,
    template?: string,
    visibility?: TemplateVisibility
  ) => Promise<TemplateTable | null>;
  delete: (profileId: number, templateId: number) => Promise<TemplateTable | null>;
};

export type TAuditLogModel = {
  get: (secretId: number) => Promise<AuditLogWithUser[]>;
  create: <T>(
    profileId: string,
    secretId: number,
    secret_version_id: number,
    action: string,
    metaData?: Record<string, T>
  ) => Promise<AuditLogTable | null>;
};

export type TSecretActive = {
  getByProjectAndProfile: (
    profileId: number,
    projectId: number
  ) => Promise<SecretActiveTable | null>;
  create: (
    githubId: string,
    projectId: number,
    secretId: number
  ) => Promise<SecretActiveTable | null>;
  update: (
    githubId: string,
    projectId: number,
    secretId: number
  ) => Promise<SecretActiveTable | null>;
  upsert: (
    githubId: string,
    projectId: number,
    secretId: number
  ) => Promise<SecretActiveTable | null>;
};

export type TSecretHistory = {
  get: (githubId: string) => Promise<SecretHistory[] | null>;
  create: (githubId: string, secretId: number) => Promise<SecretHistoryTable | null>;
};

export type TDbClient = {
  profile: TProfileModel;
  project: TProjectModel;
  environment: TEnvironmentModel;
  secret: TSecretModel;
  template: TTemplateModel;
  auditLog: TAuditLogModel;
  secretActive: TSecretActive;
  secretHistory: TSecretHistory;
};
