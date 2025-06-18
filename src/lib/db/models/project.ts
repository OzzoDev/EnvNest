import {
  CreateProject,
  ProjectTable,
  ProjectKeyTable,
  UpdateProjectName,
  OrgProjectTable,
  Profile,
} from "@/types/types";
import { executeQuery } from "../db";
import { aesEncrypt, generateAESKey } from "@/lib/aes-helpers";

const project = {
  getByProfile: async (githubId: number): Promise<ProjectTable[]> => {
    return await executeQuery<ProjectTable>(
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
        project.created_at
      FROM project
      LEFT JOIN org_project ON org_project.project_id = project.id
      LEFT JOIN org_profile ON org_profile.org_id = org_project.org_id
      LEFT JOIN profile AS org_profile_user ON org_profile.profile_id = org_profile_user.id
      JOIN profile AS owner_profile ON project.profile_id = owner_profile.id
      WHERE
        org_profile_user.github_id = $1
        OR owner_profile.github_id = $1;
    `,
      [githubId]
    );
  },
  getById: async (projectId: number, githubId: number): Promise<ProjectTable | null> => {
    return (
      (
        await executeQuery<ProjectTable>(
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
            project.created_at
          FROM project
          LEFT JOIN org_project 
            ON org_project.project_id = project.id
          LEFT JOIN org_profile 
            ON org_profile.org_id = org_project.org_id
          LEFT JOIN profile AS org_profile_user 
            ON org_profile.profile_id = org_profile_user.id
          JOIN profile AS owner_profile ON project.profile_id = owner_profile.id
          WHERE
            project.id = $1
            AND (
              org_profile_user.github_id = $2
              OR owner_profile.github_id = $2
            )
        `,
          [projectId, githubId]
        )
      )[0] ?? null
    );
  },
  getProjectOwner: async (githubId: string, projectId: number): Promise<Profile | null> => {
    const results = await executeQuery<Profile>(
      `
        SELECT 
          p.id, 
          p.github_id, 
          p.username, 
          p.email, 
          p.name,
          p.image, 
          p.created_at
        FROM profile p
        JOIN org_profile op ON op.profile_id = p.id AND op.role = 'admin'
        JOIN org o ON o.id = op.org_id
        JOIN org_project opj ON opj.org_id = o.id AND opj.project_id = $2
        WHERE EXISTS (
          SELECT 1 FROM org_profile op2
          JOIN profile p2 ON p2.id = op2.profile_id
          WHERE op2.org_id = o.id AND p2.github_id = $1
        )
        LIMIT 1;
      `,
      [githubId, projectId]
    );

    return results[0] ?? null;
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
