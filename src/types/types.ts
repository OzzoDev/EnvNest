export type User = {
  userId: string;
  token: string;
};

export type Project = {
  id: number;
  name: string;
};

export type Secret = {
  id: number;
  path: string;
  content: string;
  environment: string;
};

export type Config = User & { projectId: Project["id"] };
