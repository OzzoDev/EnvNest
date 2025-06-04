import { SecretActiveTable } from "@/types/types";
import { executeQuery } from "../db";
import profileModel from "./profile";

const secretActive = {
  getByGithubId: async (githubId: string, projectId: number): Promise<SecretActiveTable | null> => {
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
            WHERE p.github_id = $1 AND sa.project_id = $2   
          `,
          [githubId, projectId]
        )
      )[0] || null
    );
  },
  create: async (
    githubId: string,
    projectId: number,
    secretId: number
  ): Promise<SecretActiveTable | null> => {
    const profileId = (await profileModel.getByField({ github_id: githubId }))?.id;

    if (!profileId) {
      return null;
    }

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
  update: async (
    githubId: string,
    projectId: number,
    secretId: number
  ): Promise<SecretActiveTable | null> => {
    const profileId = (await profileModel.getByField({ github_id: githubId }))?.id;

    if (!profileId) {
      return null;
    }

    return (
      (
        await executeQuery<SecretActiveTable>(
          `
            UPDATE secret_active
            SET secret_id = $1
            WHERE profile_id = $2 AND project_id = $3
            RETURNING *;     
        `,
          [secretId, profileId, projectId]
        )
      )[0] || null
    );
  },
  upsert: async (
    githubId: string,
    projectId: number,
    secretId: number
  ): Promise<SecretActiveTable | null> => {
    const existing = await secretActive.getByGithubId(githubId, projectId);

    if (existing) {
      return await secretActive.update(githubId, projectId, secretId);
    }

    return (await secretActive.create(githubId, projectId, secretId)) || null;
  },
};

export default secretActive;
