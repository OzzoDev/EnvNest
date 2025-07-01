import { executeQuery } from ".";
import { Project, User } from "../types/types";

const projects = {
  find: async (userId: User["userId"]): Promise<Project[]> => {
    return await executeQuery<Project>(
      `
        SELECT DISTINCT ON (project.id)
            project.id,
            project.full_name AS name
        FROM project
        LEFT JOIN org_project 
            ON org_project.project_id = project.id
        LEFT JOIN org_profile 
            ON org_profile.org_id = org_project.org_id
            AND org_profile.profile_id = (SELECT id FROM profile WHERE github_id = $1)
        JOIN profile AS owner_profile 
            ON project.profile_id = owner_profile.id
        LEFT JOIN collaborator 
            ON collaborator.project_id = project.id
            AND collaborator.profile_id = (SELECT id FROM profile WHERE github_id = $1)
        WHERE (
            org_profile.profile_id IS NOT NULL
            OR owner_profile.github_id = $1
            OR collaborator.profile_id IS NOT NULL
            )
            AND project.private = false
        ORDER BY project.id, org_profile.role DESC;
      `,
      [userId]
    );
  },
  findKey: async (
    projectId: Project["id"],
    userId: User["userId"]
  ): Promise<string | null> => {
    return (
      (
        await executeQuery<{ key: string }>(
          `
            SELECT 
              pk.encrypted_key AS key
            FROM project_key pk
            INNER JOIN project p 
              ON p.id = pk.project_id
            LEFT JOIN profile owner 
              ON owner.id = p.profile_id
            LEFT JOIN org_project opj 
              ON opj.project_id = p.id
            LEFT JOIN org_profile op 
              ON op.org_id = opj.org_id
            LEFT JOIN profile org_member 
              ON org_member.id = op.profile_id
            LEFT JOIN collaborator c 
              ON c.project_id = p.id
            LEFT JOIN profile collab 
              ON collab.id = c.profile_id
            WHERE pk.project_id = $1
              AND (
                owner.github_id = $2
                OR org_member.github_id = $2
                OR collab.github_id = $2
              )
            LIMIT 1;
          `,
          [projectId, userId]
        )
      )[0].key ?? null
    );
  },
};

export type ProjectsType = typeof projects;

export default projects;
