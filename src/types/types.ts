export type User = {
  userId: string;
  token: string;
};

export type Project = {
  id: number;
  name: string;
};

export type Secret = {
  path: string;
  content: string;
  environment: string;
};
