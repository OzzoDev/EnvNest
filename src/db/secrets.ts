import { executeQuery } from ".";
import { Secret } from "../types/types";

const secrets = {
  find: async (projectId: number): Promise<Secret[]> => {
    return await executeQuery<Secret>(
      `
          WITH latest_version AS (
            SELECT DISTINCT ON (secret_id)
              id,
              secret_id,
              content,
              version,
              created_at
            FROM secret_version
            ORDER BY secret_id, version DESC
          )
          SELECT
            s.id,
            s.path,
            lv.content,
            e.name as environment
          FROM project p
          INNER JOIN environment e
            ON e.project_id = p.id
          INNER JOIN secret s
            ON s.environment_id = e.id
          INNER JOIN latest_version lv
            ON lv.secret_id = s.id
          WHERE p.id = $1
        `,
      [projectId]
    );
  },
};

export type SecretsType = typeof secrets;

export default secrets;
