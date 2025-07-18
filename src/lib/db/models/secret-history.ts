import { SecretHistory, SecretHistoryTable } from "@/types/types";
import { executeQuery } from "../db";
import profileModel from "./profile";

const secretHistory = {
  get: async (githubId: string): Promise<SecretHistory[] | null> => {
    const profileId = (await profileModel.getByField({ github_id: githubId }))?.id;

    if (!profileId) {
      return null;
    }

    return await executeQuery<SecretHistory>(
      `
        WITH deleted AS (
          DELETE FROM secret_history
          WHERE profile_id = $1
            AND secret_id NOT IN (SELECT id FROM secret)
        )
        
        SELECT
            sh.id, 
            sh.profile_id, 
            sh.secret_id, 
            sh.created_at AT TIME ZONE 'UTC' AS created_at,
            p.id AS project_id, 
            p.full_name as project, 
            e.name AS environment, 
            s.path AS path
        FROM secret_history sh
        INNER JOIN secret s
          ON s.id = sh.secret_id
        INNER JOIN environment e
            ON e.id = s.environment_id
        INNER JOIN project p
            ON p.id = e.project_id
        WHERE sh.profile_id = $1
        ORDER BY sh.created_at AT TIME ZONE 'UTC' DESC
      `,
      [profileId]
    );
  },
  create: async (githubId: string, secretId: number): Promise<SecretHistoryTable | null> => {
    const profileId = (await profileModel.getByField({ github_id: githubId }))?.id;
    if (!profileId) return null;

    const existingRows = await executeQuery<{ count: number }>(
      `SELECT COUNT(*)::INT AS count FROM secret_history WHERE profile_id = $1`,
      [profileId]
    );

    const count = existingRows[0]?.count ?? 0;

    if (count >= 10) {
      await executeQuery(
        `
          DELETE FROM secret_history
          WHERE id = (
            SELECT id FROM secret_history
            WHERE profile_id = $1
            ORDER BY created_at ASC
            LIMIT 1
          )
        `,
        [profileId]
      );
    }

    try {
      return (
        (
          await executeQuery<SecretHistoryTable>(
            `
              INSERT INTO secret_history (profile_id, secret_id)
              SELECT $1, $2
              WHERE EXISTS (
                SELECT 1 FROM secret WHERE id = $2
              )
              ON CONFLICT (profile_id, secret_id)
              DO UPDATE SET created_at = NOW()
              RETURNING 
                id, 
                profile_id,
                secret_id, 
                created_at AT TIME ZONE 'UTC' AS created_at;
            `,
            [profileId, secretId]
          )
        )[0] ?? null
      );
    } catch {
      return null;
    }
  },
};

export default secretHistory;
