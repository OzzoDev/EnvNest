import { SecretVersion } from "@/types/types";
import { executeQuery } from "../db";

const secretVerion = {
  getBySecretId: async (secretId: number): Promise<SecretVersion> => {
    const result = await executeQuery<SecretVersion>(
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
        id,
        secret_id,
        content,
        version,
        created_at
      FROM latest_versions
      WHERE secret_id = $1  
    `,
      [secretId]
    );

    return result[0];
  },
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
  update: async (secretId: number, content: string): Promise<SecretVersion> => {
    const secretVersionBySecretId = await secretVerion.getBySecretId(secretId);
    const latestVersion = secretVersionBySecretId.version;

    const result = await executeQuery<SecretVersion>(
      `
        INSERT INTO secret_version (secret_id, content, version)
        VALUES ($1, $2, $3)
        RETURNING *;    
      `,
      [secretId, content, latestVersion + 1]
    );

    return result[0];
  },
};

export default secretVerion;
