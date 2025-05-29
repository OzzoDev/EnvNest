import { Secret, ServerProjectSecret } from "@/types/types";
import { executeQuery } from "../db";
import secretVerionModel from "./secret-version";
import projectModel from "./project";

const secret = {
  create: async (environmentId: number, path: string): Promise<Secret> => {
    const result = await executeQuery<Secret>(
      `
        INSERT INTO secret (environment_id, path)
        VALUES ($1, $2)
        RETURNING *;    
      `,
      [environmentId, path]
    );

    return result[0];
  },
  updateVersion: async (secretId: number, content: string): Promise<ServerProjectSecret> => {
    await secretVerionModel.update(secretId, content);
    return projectModel.getById(secretId);
  },
};

export default secret;
