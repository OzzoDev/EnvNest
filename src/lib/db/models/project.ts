import {
  CreateProject,
  ProjectTable,
  ProjectKeyTable,
  UpdateProjectName,
  OrgProjectTable,
  Profile,
  ProjectWithRole,
} from "@/types/types";
import { executeQuery } from "../db";
import { aesEncrypt, generateAESKey } from "@/lib/aes-helpers";

const project = {
  getByProfile: async (githubId: number): Promise<ProjectWithRole[]> => {
    return await executeQuery<ProjectWithRole>(
      `
        SELECT DISTINCT ON (project.id)
          project.id,
          project.profile_id,
          project.repo_id,
          project.name,
          project.full_name,
          project.url,
          project.owner,
          project.private,
          project.created_at,
          COALESCE(org_profile.role, 'admin') AS role
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
        LEFT JOIN profile AS collaborator_profile 
          ON collaborator.profile_id = collaborator_profile.id
        WHERE
          (
            org_profile.profile_id IS NOT NULL
            OR owner_profile.github_id = $1
            OR collaborator_profile.github_id = $1
          )
          AND project.private = false
        ORDER BY project.id, org_profile.role DESC
      `,
      [githubId]
    );
  },
  getById: async (projectId: number, githubId: number): Promise<ProjectWithRole | null> => {
    return (
      (
        await executeQuery<ProjectWithRole>(
          `
          SELECT DISTINCT
            project.id,
            project.profile_id,
            project.repo_id,
            project.name,
            project.full_name,
            project.url,
            project.owner,
            project.private,
            project.created_at,
            COALESCE(org_profile.role, 'admin') AS role 
          FROM project
          LEFT JOIN org_project 
            ON org_project.project_id = project.id
          LEFT JOIN org_profile 
            ON org_profile.org_id = org_project.org_id
          LEFT JOIN profile AS org_profile_user 
            ON org_profile.profile_id = org_profile_user.id
          JOIN profile AS owner_profile 
            ON project.profile_id = owner_profile.id
          LEFT JOIN collaborator 
            ON collaborator.project_id = project.id
          LEFT JOIN profile AS collaborator_profile 
            ON collaborator.profile_id = collaborator_profile.id
          WHERE
            project.id = $1
            AND (
              org_profile_user.github_id = $2
              OR owner_profile.github_id = $2
              OR collaborator_profile.github_id = $2
            )
            AND project.private = false
        `,
          [projectId, githubId]
        )
      )[0] ?? null
    );
  },
  getWithAccess: async (githubId: string): Promise<ProjectTable[]> => {
    return await executeQuery<ProjectTable>(
      `
        SELECT 
          p.id,
          p.profile_id,
          p.repo_id,
          p.full_name,
          p.name,
          p.owner,
          p.url,
          p.private,
          p.created_at
        FROM project p
        INNER JOIN profile pr ON pr.id = p.profile_id
        WHERE pr.github_id = $1
          AND p.id NOT IN (
            SELECT project_id FROM org_project
          )
      `,
      [githubId]
    );
  },
  getProjectOwner: async (projectId: number): Promise<Profile | null> => {
    return (
      (
        await executeQuery<Profile>(
          `
            SELECT 
              p.id, 
              p.github_id, 
              p.username, 
              p.email, 
              p.name,
              p.image, 
              p.created_at
            FROM project pr
            JOIN profile p 
              ON p.id = pr.profile_id
            WHERE pr.id = $1
            LIMIT 1;
          `,
          [projectId]
        )
      )[0] ?? null
    );
  },
  getKey: async (projectId: number, githubId: number): Promise<ProjectKeyTable | null> => {
    const result = await executeQuery<ProjectKeyTable>(
      `
        SELECT 
          pk.id,
          pk.project_id,
          pk.encrypted_key,
          pk.created_at
        FROM project_key pk
        INNER JOIN project p 
          ON p.id = pk.project_id
        INNER JOIN profile pr 
          ON pr.id = p.profile_id
        LEFT JOIN org_project opj 
          ON opj.project_id = p.id
        LEFT JOIN org_profile op 
          ON op.org_id = opj.org_id
        LEFT JOIN profile org_pr 
          ON org_pr.id = op.profile_id
        WHERE pk.project_id = $1
          AND (
            pr.github_id = $2 -- project owner
            OR org_pr.github_id = $2 -- org member
          )
        LIMIT 1;
      `,
      [projectId, githubId]
    );

    return result[0] ?? null;
  },

  isProjectOwner: async (githubId: string, projectId: number): Promise<boolean> => {
    return !!(
      await executeQuery(
        `
          SELECT
            project.id
          FROM profile
          INNER JOIN project
            ON project.profile_id = profile.id
          WHERE profile.github_id = $1 AND project.id = $2  
        `,
        [githubId, projectId]
      )
    )[0];
  },
  hasWriteAccess: async (githubId: string, projectId: number): Promise<boolean> => {
    return !!(
      await executeQuery(
        `
          SELECT pr.id
          FROM profile pr
          WHERE pr.github_id = $1
            AND EXISTS (
              SELECT 1
              FROM project p
              WHERE p.id = $2
                AND p.private = false
                AND (
                  p.profile_id = pr.id -- ✅ Project owner
                  OR EXISTS (
                    SELECT 1
                    FROM org_project opj
                    JOIN org_profile op ON op.org_id = opj.org_id
                    WHERE opj.project_id = p.id
                      AND op.profile_id = pr.id
                      AND (op.role = 'admin' OR op.role = 'editor')
                  )
                  OR EXISTS (
                    SELECT 1
                    FROM collaborator c
                    WHERE c.project_id = p.id
                      AND c.profile_id = pr.id
                      AND c.role = 'editor'
                  )
                )
            )
        `,
        [githubId, projectId]
      )
    )[0];
  },
  create: async (
    projectData: CreateProject,
    rootEncryptionKey: string,
    orgId?: number
  ): Promise<ProjectTable> => {
    try {
      await executeQuery("BEGIN");

      const createdProjected = await project.addProject(projectData);

      const projectId = createdProjected.id;

      const encryptionKey = generateAESKey().hex;

      await project.addKey(projectId, aesEncrypt(encryptionKey, rootEncryptionKey));

      if (orgId) {
        await project.addOrg(projectId, orgId);
      }

      await executeQuery("COMMIT");

      return createdProjected;
    } catch (err) {
      await executeQuery("ROLLBACK");
      throw err;
    }
  },
  addProject: async (projectData: CreateProject): Promise<ProjectTable> => {
    const { profile_id, repo_id, name, full_name, owner, url, private: isPrivate } = projectData;

    const result = await executeQuery<ProjectTable>(
      `
        INSERT INTO project (profile_id, repo_id, name, full_name, owner, url, private)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;    
      `,
      [profile_id, repo_id, name, full_name, owner, url, isPrivate]
    );

    return result[0];
  },
  addKey: async (projectId: number, encryptedKey: string): Promise<ProjectKeyTable> => {
    const result = await executeQuery<ProjectKeyTable>(
      `
        INSERT INTO project_key (project_id, encrypted_key)
        VALUES ($1, $2)
        RETURNING *;    
      `,
      [projectId, encryptedKey]
    );

    return result[0];
  },
  addOrg: async (projectId: number, orgId: number): Promise<OrgProjectTable> => {
    return (
      await executeQuery<OrgProjectTable>(
        `
          INSERT INTO org_project (project_id, org_id)
          VALUES ($1, $2)
          RETURNING *;
        `,
        [projectId, orgId]
      )
    )[0];
  },
  updateName: async (project: UpdateProjectName): Promise<ProjectTable | null> => {
    if (!project) {
      return null;
    }

    const { name, full_name, repo_id } = project;

    const result = await executeQuery<ProjectTable>(
      `
      UPDATE project
      SET 
        name = $1, 
        full_name = $2
      WHERE repo_id = $3
      RETURNING *; 
    `,
      [name, full_name, repo_id]
    );

    return result[0];
  },
  syncProjectVisibility: async (
    projectId: number,
    isPrivate: boolean
  ): Promise<ProjectTable | null> => {
    return (
      (
        await executeQuery<ProjectTable>(
          `
            UPDATE project
            SET private = $1
            WHERE id = $2
            RETURNING *;
          `,
          [isPrivate, projectId]
        )
      )[0] ?? null
    );
  },
  delete: async (projectId: number): Promise<ProjectTable> => {
    const result = await executeQuery<ProjectTable>(
      `
      DELETE FROM project 
      WHERE id = $1
    `,
      [projectId]
    );

    return result[0];
  },
};

export default project;
