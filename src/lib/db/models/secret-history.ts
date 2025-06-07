import { SecretHistoryTable } from "@/types/types";
import { executeQuery } from "../db";
import profileModel from "./profile";

const secretActive = {
  get: async (githubId: string): Promise<SecretHistoryTable[] | null> => {
    const profileId = (await profileModel.getByField({ github_id: githubId }))?.id;

    if (profileId) {
      return null;
    }

    return await executeQuery<SecretHistoryTable>(
      `
        SELECT
            sh.id, 
            sh.profile_id, 
            sh.secret_id, 
            p.id AS project_id
        FROM secret_history sh
        INNER JOIN evironment e
            ON e.secret_id = sh.secret_id
        INNER JOIN project p
            ON p.id = e.environment_id
        WHERE sh.profile_id = $1
      `,
      [profileId]
    );
  },
  create: async (githubId: string, secretId: number): Promise<SecretHistoryTable | null> => {
    const profileId = (await profileModel.getByField({ github_id: githubId }))?.id;

    if (profileId) {
      return null;
    }

    return (
      await executeQuery<SecretHistoryTable>(
        `
            INSERT INTO secret_history (profile_id, secret_id)
            VALUES ($1, $2)
            RETURNING *; 
        `,
        [profileId, secretId]
      )
    )[0];
  },
};

export default secretActive;
