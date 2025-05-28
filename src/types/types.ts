//User type form next/auth
export type NextAuthUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

// Github-authenticated user shape
export type GithubUser = {
  github_id: string;
  username: string;
  name?: string;
  email?: string;
  image?: string;
};

export type GithubUserNoId = Omit<GithubUser, "github_id">;

// Base user table
export type Profile = GithubUser & {
  id: number;
  created_at: string; // ISO 8601 timestamp
};

// Organization
export type Org = {
  id: number;
  name: string;
  created_at: string;
};

// Organization members (junction table)
export type OrgProfile = {
  id: number;
  org_id: number;
  profile_id: number;
  role: "member" | "admin" | "viewer" | "editor";
  created_at: string;
};

// Projects under an organization
export type Project = {
  id: number;
  profile_id: number;
  repo_id: number;
  name: string;
  full_name: string;
  owner: string;
  url: string;
  created_at: string;
};

export type CreateProject = Omit<Project, "id" | "created_at">;

export type UpdateProjectName = Omit<Project, "id" | "profile_id" | "owner" | "url" | "created_at">;

// Project encryption key (AES-256-GCM encrypted & base64 encoded)
export type ProjectKey = {
  id: number;
  project_id: number;
  encrypted_key: string;
  created_at: string;
};

// Environments under a project (e.g., "development", "production")
export type Environment = {
  id: number;
  project_id: number;
  name: string;
  created_at: string;
};

export type EnvironmentName = "development" | "production";

// Environment secrets (one row = one `.env` file)
export type Secret = {
  id: number;
  environment_id: number;
  path: string; // e.g. `.env`, `.env.production`
  content: string; // encrypted full env file
  version: number;
  created_at: string;
  updated_at: string;
};

// Version history for a secret
export type SecretVersion = {
  id: number;
  secret_id: number;
  content: string;
  version: number;
  created_at: string;
};

// Project collaborators (manual sharing)
export type Collaborator = {
  id: number;
  profile_id: number;
  project_id: number;
  role: "viewer" | "editor" | "admin" | string;
  created_at: string;
};

// Action logs for audit purposes
export type AuditLog<T = unknown> = {
  id: number;
  profile_id: number;
  project_id: number;
  action: string;
  metadata: Record<string, T>; // JSONB metadata
  created_at: string;
};

//Github organization
export type GithubOrg = {
  login: string;
};

//Github repo
export type GithubRepo = {
  id: number;
  name: string;
  full_name: string;
  owner: GithubOwner;
  fork: boolean;
  disabled: boolean;
  archived: boolean;
  private: false;
  html_url: string;
  created_at: string;
};

//Github owner
export type GithubOwner = {
  login?: string;
  type: string;
};
