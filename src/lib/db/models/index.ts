import { TDbClient } from "../../../types/db-models-types";
import { initDB } from "../db";
import profileModel from "./profile";
import projectModel from "./project";
import environmentModel from "./environment";
import secretModel from "./secret";
import secretVersionModel from "./secret-version";

let isDbInitialized = false;

export const getDbClient = async (): Promise<TDbClient> => {
  if (!isDbInitialized) {
    try {
      await initDB();
      isDbInitialized = true;
    } catch (err) {
      console.error("Error initalizing db", err);
      throw err;
    }
  }

  return {
    profile: profileModel,
    project: projectModel,
    environment: environmentModel,
    secret: secretModel,
    secretVersion: secretVersionModel,
  };
};
