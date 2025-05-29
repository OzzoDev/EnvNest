import { Secret } from "@/types/types";
import { executeQuery } from "../db";

const secret = {
  create: async (environmentId: number, path: string): Promise<Secret> => {
    const result = await executeQuery<Secret>(
      `
        INSERT INTO secret (environment_id, path)
        VALUES ($1, $2)
        RETURNING *;    
      `,
      [environmentId, path]
    );

    return result[0];
  },
};

export default secret;
