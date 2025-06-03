import { EnvironmentTable, EnvironmentName } from "@/types/types";
import { executeQuery } from "../db";

const environment = {
  create: async (projectId: number, environment: EnvironmentName): Promise<EnvironmentTable> => {
    const result = await executeQuery<EnvironmentTable>(
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
