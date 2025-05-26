import { Project, ProjectKey } from "@/types/types";
import { executeQuery } from "../db";
import { aesEncrypt, generateAESKey } from "@/lib/aes-helpers";

const project = {
  create: async (profileId: number, name: string, encryptionKey: string): Promise<Project> => {
    try {
      await executeQuery("BEGIN");

      const projectData = await project.addName(profileId, name);

      await project.addKey(projectData.id, aesEncrypt(generateAESKey().hex, encryptionKey));

      await executeQuery("COMMIT");

      return projectData;
    } catch (err) {
      await executeQuery("ROLLBACK");
      throw err;
    }
  },
  addName: async (profileId: number, name: string): Promise<Project> => {
    const result = await executeQuery<Project>(
      `
        INSERT INTO project (profile_id, name)
        VALUES ($1, $2)
        RETURNING *;    
      `,
      [profileId, name]
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
