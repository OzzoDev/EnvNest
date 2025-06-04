import { EnvironmentName, EnvironmentSecret, SecretTable } from "@/types/types";
import { executeQuery } from "../db";
import environmentModel from "./environment";

const secret = {
  getById: async (secretId: number): Promise<EnvironmentSecret> => {
    return (
      await executeQuery<EnvironmentSecret>(
        `
          WITH latest_version AS (
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
            s.id AS id,
            s.path,
            s.updated_at AS updated_at,
            e.name as environment,
            lv.id as secret_version_id,
            lv.version,
            lv.content,
            lv.created_at AS created_at
          FROM environment e
          INNER JOIN secret s
            ON s.environment_id = e.id
          INNER JOIN latest_version lv
            ON lv.secret_id = s.id
          WHERE s.id = $1
        `,
        [secretId]
      )
    )[0];
  },
  getByProject: async (projectId: number): Promise<EnvironmentSecret[]> => {
    return await executeQuery<EnvironmentSecret>(
      `
          WITH latest_version AS (
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
            s.id AS id,
            s.path,
            s.updated_at AS updated_at,
            e.name as environment,
            lv.id as secret_version_id,
            lv.version,
            lv.content,
            lv.created_at AS created_at
          FROM project p
          INNER JOIN environment e
            ON e.project_id = p.id
          INNER JOIN secret s
            ON s.environment_id = e.id
          INNER JOIN latest_version lv
            ON lv.secret_id = s.id
          WHERE p.id = $1
        `,
      [projectId]
    );
  },
  getByEnvironment: async (
    projectId: number,
    environment: EnvironmentName
  ): Promise<EnvironmentSecret[]> => {
    return await executeQuery<EnvironmentSecret>(
      `
          WITH latest_version AS (
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
            s.id AS id,
            s.path,
            s.updated_at AS updated_at,
            e.name as environment,
            lv.id as secret_version_id,
            lv.version,
            lv.content,
            lv.created_at AS created_at
          FROM project p
          INNER JOIN environment e
            ON e.project_id = p.id
          INNER JOIN secret s
            ON s.environment_id = e.id
          INNER JOIN latest_version lv
            ON lv.secret_id = s.id
          WHERE p.id = $1 AND e.name = $2
        `,
      [projectId, environment]
    );
  },
  create: async (
    projectId: number,
    environment: EnvironmentName,
    path: string,
    content: string
  ): Promise<EnvironmentSecret | null> => {
    try {
      await executeQuery("BEGIN");

      const environmentId = (await environmentModel.create(projectId, environment)).id;

      const secretId = (
        await executeQuery<SecretTable>(
          `
            INSERT INTO secret (environment_id, path)
            VALUES ($1, $2)
            RETURNING *;
          `,
          [environmentId, path]
        )
      )[0].id;

      await executeQuery(
        `
          INSERT INTO secret_version (secret_id, content, version)
          VALUES ($1, $2, $3)
          RETURNING *;    
        `,
        [secretId, content, 1]
      );

      await executeQuery("COMMIT");

      return await secret.getById(secretId);
    } catch (err) {
      await executeQuery("ROLLBACK");

      return null;
    }
  },
  update: async (secretId: number, content: string): Promise<EnvironmentSecret | null> => {
    try {
      await executeQuery(`BEGIN`);

      await executeQuery(
        `
          SELECT * FROM secret
          WHERE id = $1
          FOR UPDATE
        `,
        [secretId]
      );

      await executeQuery(
        `
          INSERT INTO secret_version (secret_id, content, version)
          SELECT $1, $2, COALESCE(MAX(version), 0) + 1
          FROM secret_version
          WHERE secret_id = $1
        `,
        [secretId, content]
      );

      await executeQuery(
        `
          UPDATE secret
          SET updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `,
        [secretId]
      );

      await executeQuery(`COMMIT`);

      return await secret.getById(secretId);
    } catch (err) {
      await executeQuery(`ROLLBACK`);
      console.error("Error updating secret version:", err);
      return null;
    }
  },
};

export default secret;
