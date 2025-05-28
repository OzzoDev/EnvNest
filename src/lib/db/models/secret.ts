import { Secret } from "@/types/types";
import { executeQuery } from "../db";

const secret = {
  create: async (environmentId: number, path: string, content: string): Promise<Secret> => {
    const result = await executeQuery<Secret>(
      `
        INSERT INTO secret (environment_id, path, content)
        VALUES ($1, $2, $3)
        RETURNING *;    
      `,
      [environmentId, path, content]
    );

    return result[0];
  },
};

export default secret;
