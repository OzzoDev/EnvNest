import { CreateProject, ProjectTable, ProjectKeyTable, UpdateProjectName } from "@/types/types";
import { executeQuery } from "../db";
import { aesEncrypt, generateAESKey } from "@/lib/aes-helpers";

const project = {
  getByProfile: async (githubId: number): Promise<ProjectTable[]> => {
    return await executeQuery<ProjectTable>(
      `
      SELECT
        project.id AS id,
        profile.id AS profile_id,
        project.repo_id AS repo_id,
        project.name AS name,
        project.full_name AS full_name,
        project.url AS url,
        project.created_at AS created_at
      FROM project
      INNER JOIN profile
        ON profile.id = project.profile_id 
      WHERE profile.github_id = $1
    `,
      [githubId]
    );
  },
  getById: async (projectId: number, githubId: number): Promise<ProjectTable> => {
    return (
      await executeQuery<ProjectTable>(
        `
          SELECT 
            p.id, 
            p.profile_id,
            p.repo_id,
            p.name, 
            p.full_name, 
            p.owner,
            p.url,
            p.created_at
          FROM project p
          INNER JOIN profile pr
            ON pr.id = p.profile_id
          WHERE p.id = $1 AND pr.github_id = $2
        `,
        [projectId, githubId]
      )
    )[0];
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
        WHERE pk.project_id = $1 AND pr.github_id = $2
      `,
      [projectId, githubId]
    );

    if (result.length === 0) {
      return null;
    }

    return result[0];
  },
  create: async (projectData: CreateProject, rootEncryptionKey: string): Promise<ProjectTable> => {
    try {
      await executeQuery("BEGIN");

      const createdProjected = await project.addProject(projectData);

      const projectId = createdProjected.id;

      const encryptionKey = generateAESKey().hex;

      await project.addKey(projectId, aesEncrypt(encryptionKey, rootEncryptionKey));

      await executeQuery("COMMIT");

      return createdProjected;
    } catch (err) {
      await executeQuery("ROLLBACK");
      throw err;
    }
  },
  addProject: async (projectData: CreateProject): Promise<ProjectTable> => {
    const { profile_id, repo_id, name, full_name, owner, url } = projectData;

    const result = await executeQuery<ProjectTable>(
      `
        INSERT INTO project (profile_id, repo_id, name, full_name, owner, url)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;    
      `,
      [profile_id, repo_id, name, full_name, owner, url]
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
