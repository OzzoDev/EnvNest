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
};

export type ProjectsType = typeof projects;

export default projects;
