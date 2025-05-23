export type GithubUser = {
  name: string;
  email: string;
  image: string;
};

export type Profile = GithubUser & { id: number };
