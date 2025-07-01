import { Pool } from "pg";
import dotenv from "dotenv";
import projects, { ProjectsType } from "./projects";
import secrets, { SecretsType } from "./secrets";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const sanitizeValues = (values: unknown[]) => {
  return values.map((value) => {
    if (typeof value === "string") {
      return value.trim();
    }
    return value;
  });
};

export const executeQuery = async <T>(
  queryText: string,
  values: unknown[] = []
): Promise<T[]> => {
  const sanitizedValues = sanitizeValues(values);
  const client = await pool.connect();

  try {
    const response = await client.query(queryText, sanitizedValues);
    return response.rows as T[];
  } catch (err) {
    console.error("Database query error:", err);
    throw err;
  } finally {
    client.release();
  }
};

type dbClientType = {
  projects: ProjectsType;
  secrets: SecretsType;
};

export const getDbClient = async (): Promise<dbClientType> => {
  return {
    projects: projects,
    secrets: secrets,
  };
};
