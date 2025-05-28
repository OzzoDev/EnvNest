import { Environment, EnvironmentName } from "@/types/types";
import { executeQuery } from "../db";

const environment = {
  create: async (projectId: number, environment: EnvironmentName): Promise<Environment> => {
    const result = await executeQuery<Environment>(
      `
        INSERT INTO environment (project_id, name)
        VALUES ($1, $2)
        RETURNING *;    
    `,
      [projectId, environment]
    );

    return result[0];
  },
};

export default environment;
