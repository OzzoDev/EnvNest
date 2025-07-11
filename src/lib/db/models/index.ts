import { TDbClient } from "../../../types/db-models-types";
import { initDB } from "../db";
import profileModel from "./profile";
import projectModel from "./project";
import environmentModel from "./environment";
import secretModel from "./secret";
import templateModel from "./template";
import auditLogModel from "./audit-log";
import secretActiveModel from "./secret-active";
import secretHistoryModel from "./secret-history";
import collaboratorModel from "./collaborator";
import organizationModel from "./organization";

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
    template: templateModel,
    auditLog: auditLogModel,
    secretActive: secretActiveModel,
    secretHistory: secretHistoryModel,
    collaborator: collaboratorModel,
    organization: organizationModel,
  };
};
