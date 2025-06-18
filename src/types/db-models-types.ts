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
  CollaboratorTable,
  ProjectWithCollaborators,
  OrgTable,
  Org,
  OrgProfileTable,
  OrgRole,
  OrgProjectTable,
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
  getById: (projectId: number, githubId: number) => Promise<ProjectTable | null>;
  getKey: (projectId: number, githubId: number) => Promise<ProjectKeyTable | null>;
  getProjectOwner: (projectId: number) => Promise<Profile | null>;
  isProjectOwner: (githubId: string, projectId: number) => Promise<boolean>;
  hasWriteAccess: (githubId: string, projectId: number) => Promise<boolean>;
  create: (
    projectData: CreateProject,
    encryptionKey: string,
    orgId?: number
  ) => Promise<ProjectTable>;
  addProject: (projectData: CreateProject) => Promise<ProjectTable>;
  addKey: (projectId: number, encryptedKey: string) => Promise<ProjectKeyTable>;
  addOrg: (projectId: number, orgId: number) => Promise<OrgProjectTable>;
  updateName: (project: UpdateProjectName) => Promise<ProjectTable | null>;
  syncProjectVisibility: (projectId: number, isPrivate: boolean) => Promise<ProjectTable | null>;
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

export type TCollaborator = {
  getCollaboratorsInProject: (
    projectId: number,
    githubId: string
  ) => Promise<ProjectWithCollaborators | null>;
  getByProfileId: (profileId: number, projectId: number) => Promise<CollaboratorTable | null>;
  create: (profileId: number, projectId: number, role: string) => Promise<CollaboratorTable | null>;
  update: (profileId: number, projectId: number, role: string) => Promise<CollaboratorTable | null>;
  delete: (profileId: number, projectId: number) => Promise<CollaboratorTable | null>;
};

export type TOrganization = {
  get: (profileId: number) => Promise<Org[]>;
  getMember: (profileId: number, orgId: number) => Promise<OrgProfileTable | null>;
  getAsAdmin: (profileId: number) => Promise<OrgTable[]>;
  isOrgAdmin: (profileId: number, orgId: number) => Promise<boolean>;
  create: (profileId: number, name: string) => Promise<OrgTable | null>;
  addMember: (profileId: number, orgId: number, role: OrgRole) => Promise<OrgProfileTable | null>;
  update: (orgId: number, name: string) => Promise<OrgTable | null>;
  updateMemberRole: (
    profileId: number,
    orgId: number,
    role: OrgRole
  ) => Promise<OrgProfileTable | null>;
  delete: (orgId: number) => Promise<OrgTable | null>;
  deleteMember: (profileId: number, orgId: number) => Promise<OrgProfileTable | null>;
  leave: (profileId: number, orgId: number) => Promise<OrgProfileTable | null>;
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
  collaborator: TCollaborator;
  organization: TOrganization;
};
