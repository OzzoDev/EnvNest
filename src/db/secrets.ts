import { executeQuery, getDbClient } from ".";
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
  update: async (userId: string, secretId: number, content: string) => {
    try {
      await executeQuery(`BEGIN`);

      await executeQuery(
        `
          SELECT * FROM secret
          WHERE id = $1
          FOR UPDATE
        `,
        [secretId]
      );

      const secretVersionId =
        (
          await executeQuery<{ id: number }>(
            `
          INSERT INTO secret_version (secret_id, content, version)
          SELECT $1, $2, COALESCE(MAX(version), 0) + 1
          FROM secret_version
          WHERE secret_id = $1
          RETURNING id;
        `,
            [secretId, content]
          )
        )[0]?.id ?? null;

      await executeQuery(
        `
          UPDATE secret
          SET updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `,
        [secretId]
      );

      const db = await getDbClient();

      await db.auditLogs.create(
        userId,
        secretId,
        secretVersionId,
        "Synced with CLI",
        { type: "CLI" }
      );

      await executeQuery(`COMMIT`);
    } catch (err) {
      await executeQuery(`ROLLBACK`);
      return null;
    }
  },
};

export type SecretsType = typeof secrets;

export default secrets;
