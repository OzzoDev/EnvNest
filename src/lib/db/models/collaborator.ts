import { CollaboratorTable } from "@/types/types";
import { executeQuery } from "../db";

const collaborator = {
  getByProfileId: async (
    profileId: number,
    projectId: number
  ): Promise<CollaboratorTable | null> => {
    return (
      (
        await executeQuery<CollaboratorTable>(
          `
            SELECT * 
            FROM collaborator
            WHERE profile_id = $1 AND project_id = $2
          `,
          [profileId, projectId]
        )
      )[0] ?? null
    );
  },
  create: async (
    profileId: number,
    projectId: number,
    role: string
  ): Promise<CollaboratorTable | null> => {
    return (
      (
        await executeQuery<CollaboratorTable>(
          `
            INSERT INTO collaborator (profile_id, project_id, role)
            VALUES ($1, $2, $3)
            ON CONFLICT (profile_id, project_id) DO NOTHING
            RETURNING *;
          `,
          [profileId, projectId, role]
        )
      )[0] ?? null
    );
  },
};

export default collaborator;
