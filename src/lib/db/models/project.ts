import { CreateProject, Project, ProjectKey } from "@/types/types";
import { executeQuery } from "../db";
import { aesEncrypt, generateAESKey } from "@/lib/aes-helpers";

const project = {
  getByProfile: async (githubId: number): Promise<Project[]> => {
    return await executeQuery<Project>(
      `
      SELECT * 
      FROM project
      INNER JOIN profile
        ON profile.id = project.profile_id 
      WHERE profile.github_id = $1
    `,
      [githubId]
    );
  },
  create: async (projectData: CreateProject, encryptionKey: string): Promise<Project> => {
    try {
      await executeQuery("BEGIN");

      const createdProjected = await project.addProject(projectData);

      await project.addKey(createdProjected.id, aesEncrypt(generateAESKey().hex, encryptionKey));

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
};

export default project;
