import { SecretActiveTable } from "@/types/types";
import { executeQuery } from "../db";

const secretActive = {
  getByGithubId: async (githubId: number): Promise<SecretActiveTable | null> => {
    return (
      (
        await executeQuery<SecretActiveTable>(
          `
        SELECT
            sa.id,
            sa.profile_id, 
            sa.project_id, 
            sa.secret_id
        FROM secret_active sa
        INNER JOIN profile p
            ON p.id = sa.profile_id
        WHERE p.github_id = $1    
    `,
          [githubId]
        )
      )[0] || null
    );
  },
  getByProfileId: async (profileId: number): Promise<SecretActiveTable | null> => {
    return (
      (
        await executeQuery<SecretActiveTable>(
          `
            SELECT *
            FROM secret_active
            WHERE profile_id = $1    
        `,
          [profileId]
        )
      )[0] || null
    );
  },
  create: async (
    profileId: number,
    projectId: number,
    secretId: number
  ): Promise<SecretActiveTable | null> => {
    return (
      (
        await executeQuery<SecretActiveTable>(
          `
            INSERT INTO secret_active (profile_id, project_id, secret_id)
            VALUES ($1, $2, $3)
            RETURNING *;    
        `,
          [profileId, projectId, secretId]
        )
      )[0] || null
    );
  },
  update: async (profileId: number, secretId: number): Promise<SecretActiveTable | null> => {
    return (
      (
        await executeQuery<SecretActiveTable>(
          `
            UPDATE secret_active
            SET secret_id = $1
            WHERE profile_id = $2
            RETURNING *;     
        `,
          [secretId, profileId]
        )
      )[0] || null
    );
  },
  upsert: async (
    profileId: number,
    projectId: number,
    secretId: number
  ): Promise<SecretActiveTable | null> => {
    const existing = await secretActive.getByProfileId(profileId);

    if (existing) {
      return await secretActive.update(profileId, secretId);
    }

    return (await secretActive.create(profileId, projectId, secretId)) || null;
  },
};

export default secretActive;
