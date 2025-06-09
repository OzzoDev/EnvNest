import { THelpersClient } from "@/types/helpers-types";
import githubHelpers from "./github";
import apiHelpers from "./api";

export const getHelpersClient = async (): Promise<THelpersClient> => {
  return {
    github: githubHelpers,
    api: apiHelpers,
  };
};
