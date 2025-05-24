import { TDbClient } from "../../../../types/db-models-types";
import profileModel from "./profile";

export const getDbClient = (): TDbClient => {
  return {
    profile: profileModel,
  };
};
