import {
  CreateProject,
  Project,
  ProjectKey,
  ProjectSecret,
  UpdateProjectName,
} from "@/types/types";
import { executeQuery } from "../db";
import { aesEncrypt, generateAESKey } from "@/lib/aes-helpers";
import environmentModel from "./environment";
import secretModel from "./secret";
import secretVersionModel from "./secret-version";

const project = {
  getByProfile: async (githubId: number): Promise<Project[]> => {
    return await executeQuery<Project>(
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
  getById: async (projectId: number): Promise<ProjectSecret> => {
    const result = await executeQuery<ProjectSecret>(
      `
      WITH latest_versions AS (
        SELECT DISTINCT ON (secret_id)
          id,
          secret_id,
          content,
          version,
          created_at
        FROM secret_version
        ORDER BY secret_id, version DESC
      )
      SELECT
        p.id AS project_id,
        p.profile_id,
        p.repo_id,
        p.name,
        p.full_name,
        p.owner,
        p.url,
        p.created_at AS project_created_at,
        pk.encrypted_key,
        e.id AS environment_id,
        e.name AS environment,
        s.id AS secret_id,
        s.path,
        s.updated_at AS secret_updated_at,
        lv.content,
        lv.version AS secret_version
      FROM project p
      LEFT JOIN project_key pk
        ON pk.project_id = p.id
      LEFT JOIN environment e
        ON e.project_id = p.id
      LEFT JOIN secret s
        ON s.environment_id = e.id
      LEFT JOIN latest_versions lv
        ON lv.secret_id = s.id
      WHERE p.id = $1
       
    `,
      [projectId]
    );

    return result[0];
  },

  create: async (projectData: CreateProject, encryptionKey: string): Promise<Project> => {
    try {
      await executeQuery("BEGIN");

      const createdProjected = await project.addProject(projectData);

      const projectId = createdProjected.id;

      await project.addKey(projectId, aesEncrypt(generateAESKey().hex, encryptionKey));

      const environment = await environmentModel.create(projectId, "development");

      const secret = await secretModel.create(environment.id, "./");

      await secretVersionModel.create(secret.id, "", 1);

      await executeQuery("COMMIT");

      return createdProjected;
    } catch (err) {
      await executeQuery("ROLLBACK");
      throw err;
    }
  },
  addProject: async (projectData: CreateProject): Promise<Project> => {
    const { profile_id, repo_id, name, full_name, owner, url } = projectData;

    const result = await executeQuery<Project>(
      `
        INSERT INTO project (profile_id, repo_id, name, full_name, owner, url)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;    
      `,
      [profile_id, repo_id, name, full_name, owner, url]
    );

    return result[0];
  },
  addKey: async (projectId: number, encryptedKey: string): Promise<ProjectKey> => {
    const result = await executeQuery<ProjectKey>(
      `
        INSERT INTO project_key (project_id, encrypted_key)
        VALUES ($1, $2)
        RETURNING *;    
      `,
      [projectId, encryptedKey]
    );

    return result[0];
  },
  updateName: async (project: UpdateProjectName): Promise<Project | null> => {
    if (!project) {
      return null;
    }

    const { name, full_name, repo_id } = project;

    const result = await executeQuery<Project>(
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
};

export default project;
