import { SecretVersion } from "@/types/types";
import { executeQuery } from "../db";

const secretVerion = {
  create: async (secretId: number, content: string, version: number): Promise<SecretVersion> => {
    const result = await executeQuery<SecretVersion>(
      `
        INSERT INTO secret_version (secret_id, content, version)
        VALUES ($1, $2, $3)
        RETURNING *;    
      `,
      [secretId, content, version]
    );

    return result[0];
  },
};

export default secretVerion;
