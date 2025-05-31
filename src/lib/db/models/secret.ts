import { EnvironmentName, Secret, ServerProjectSecret } from "@/types/types";
import { executeQuery } from "../db";
import secretVerionModel from "./secret-version";
import projectModel from "./project";
import environmentModel from "./environment";

const secret = {
  create: async (
    projectId: number,
    environment: EnvironmentName,
    path: string,
    content: string
  ): Promise<Secret | null> => {
    try {
      await executeQuery("BEGIN");

      const environmentId = (await environmentModel.create(projectId, environment)).id;

      const secret = (
        await executeQuery<Secret>(
          `
        INSERT INTO secret (environment_id, path)
        VALUES ($1, $2)
        RETURNING *;
      `,
          [environmentId, path]
        )
      )[0];

      await secretVerionModel.create(secret.id, content, 1);

      await executeQuery("COMMIT");

      return secret;
    } catch (err) {
      await executeQuery("ROLLBACK");

      return null;
    }
  },
  updateVersion: async (secretId: number, content: string): Promise<ServerProjectSecret> => {
    await secretVerionModel.update(secretId, content);
    return projectModel.getById(secretId);
  },
};

export default secret;
