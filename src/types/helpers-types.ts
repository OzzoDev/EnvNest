import { EnvironmentName } from "./types";

export type TGihubHelpers = {
  getPaths: (
    owner: string,
    repo: string,
    accessToken: string,
    projectId: number,
    environment: EnvironmentName
  ) => Promise<string[]>;
};

export type THelpersClient = {
  github: TGihubHelpers;
};
