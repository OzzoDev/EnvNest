import { SecretActiveTable } from "@/types/types";
import { executeQuery } from "../db";
import profileModel from "./profile";

const secretActive = {
  getByProjectAndProfile: async (
    profileId: number,
    projectId: number
  ): Promise<SecretActiveTable | null> => {
    return (
      (
        await executeQuery<SecretActiveTable>(
          `
            SELECT *
            FROM secret_active
            WHERE profile_id = $1 AND project_id = $2   
          `,
          [profileId, projectId]
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
            ON CONFLICT (profile_id, project_id, secret_id) DO NOTHING
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
    const profileId = (await profileModel.getByField({ github_id: githubId }))?.id;

    if (!profileId) {
      return null;
    }

    const existing = await secretActive.getByProjectAndProfile(profileId, projectId);

    if (existing) {
      return await secretActive.update(githubId, projectId, secretId);
    }

    return (await secretActive.create(githubId, projectId, secretId)) || null;
  },
};

export default secretActive;
