import { THelpersClient } from "@/types/helpers-types";
import githubHelpers from "./github";

export const gethelpersClient = async (): Promise<THelpersClient> => {
  return {
    github: githubHelpers,
  };
};
