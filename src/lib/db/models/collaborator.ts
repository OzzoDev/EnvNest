import { CollaboratorTable, ProjectWithCollaborators } from "@/types/types";
import { executeQuery } from "../db";

const collaborator = {
  getCollaboratorsInProject: async (projectId: number): Promise<ProjectWithCollaborators[]> => {
    return await executeQuery<ProjectWithCollaborators>(
      `
        SELECT
            p.full_name,
            p.id AS project_id,
            (
                SELECT json_agg(json_build_object('username', pr.username, 'role', c.role))
                FROM collaborator c
                JOIN profile pr ON c.profile_id = pr.id
                WHERE c.project_id = p.id
            ) AS collaborators
            FROM project p
            WHERE p.id = $1;  
      `,
      [projectId]
    );
  },
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
  update: async (
    profileId: number,
    projectId: number,
    role: string
  ): Promise<CollaboratorTable | null> => {
    return (
      (
        await executeQuery<CollaboratorTable>(
          `
            UPDATE collaborator
            SET role = $3
            WHERE profile_id = $1 AND project_id = $2  
          `,
          [profileId, projectId, role]
        )
      )[0] ?? null
    );
  },
  delete: async (profileId: number, projectId: number): Promise<CollaboratorTable | null> => {
    return (
      (
        await executeQuery<CollaboratorTable>(
          `
            DELETE FROM collaborator
            WHERE profile_id = $1 AND project_id = $2
            RETURNING *;
          `,
          [profileId, projectId]
        )
      )[0] ?? null
    );
  },
};

export default collaborator;
