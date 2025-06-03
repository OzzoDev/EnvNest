import { EnvironmentName, EnvironmentSecret, SecretTable, ServerSecret } from "@/types/types";
import { executeQuery } from "../db";
import secretVerionModel from "./secret-version";
import environmentModel from "./environment";

const secret = {
  getById: async (secretId: number): Promise<EnvironmentSecret> => {
    return (
      await executeQuery<EnvironmentSecret>(
        `
          WITH latest_version AS (
            SELECT DISTINCT ON (secret_id)
              id
              secret_id,
              content,
              version,
              created_at
            FROM secret_version
            ORDER BY secret_id, version DESC
          )
          SELECT
            s.id AS id,
            s.path,
            s.updated_at AS updated_at,
            e.name as environment,
            lv.version,
            lv.content,
            lv.created_at AS created_at
          FROM environment e
          INNER JOIN secret s
            ON s.environment_id = e.id
          INNER JOIN latest_version lv
            ON lv.secret_id = $1
          WHERE s.id = $1
        `,
        [secretId]
      )
    )[0];
  },
  create: async (
    projectId: number,
    environment: EnvironmentName,
    path: string,
    content: string
  ): Promise<number | null> => {
    try {
      await executeQuery("BEGIN");

      const environmentId = (await environmentModel.create(projectId, environment)).id;

      const secretId = (
        await executeQuery<SecretTable>(
          `
            INSERT INTO secret (environment_id, path)
            VALUES ($1, $2)
            RETURNING *;
          `,
          [environmentId, path]
        )
      )[0].id;

      await secretVerionModel.create(secretId, content, 1);

      await executeQuery("COMMIT");

      return secretId;
    } catch (err) {
      await executeQuery("ROLLBACK");

      return null;
    }
  },
  updateVersion: async (secretId: number, content: string): Promise<ServerSecret | void> => {
    await secretVerionModel.update(secretId, content);
    // return projectModel.getById(secretId);
  },
};

export default secret;
