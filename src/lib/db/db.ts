import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const sanitizeValues = (values: any[]) => {
  return values.map((value) => {
    if (typeof value === "string") {
      return value.trim();
    }
    return value;
  });
};

export const executeQuery = async <T>(queryText: string, values: unknown[] = []): Promise<T[]> => {
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

export const initDB = async () => {
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS profile (
      id SERIAL PRIMARY KEY,
      github_id TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      email TEXT,
      name TEXT,
      image TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await executeQuery(`
    CREATE TABLE IF NOT EXISTS org (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await executeQuery(`
    CREATE TABLE IF NOT EXISTS org_profile (
      id SERIAL PRIMARY KEY,
      org_id INTEGER REFERENCES org(id) ON DELETE CASCADE,
      profile_id INTEGER REFERENCES profile(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'member',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(org_id, profile_id)
    );
  `);

  await executeQuery(`
    CREATE TABLE IF NOT EXISTS project (
      id SERIAL PRIMARY KEY,
      profile_id INTEGER REFERENCES profile(id) ON DELETE CASCADE,
      repo_id INTEGER UNIQUE NOT NULL,
      name TEXT NOT NULL,
      full_name TEXT NOT NULL,
      owner TEXT NOT NULL,
      url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(profile_id, name)
    );
  `);

  await executeQuery(`
    CREATE TABLE IF NOT EXISTS project_key (
      id SERIAL PRIMARY KEY,
      project_id INTEGER REFERENCES project(id) ON DELETE CASCADE,
      encrypted_key TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await executeQuery(`
    CREATE TABLE IF NOT EXISTS environment (
      id SERIAL PRIMARY KEY,
      project_id INTEGER REFERENCES project(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(project_id, name)
    );
  `);

  await executeQuery(`
    CREATE TABLE IF NOT EXISTS secret (
      id SERIAL PRIMARY KEY,
      environment_id INTEGER REFERENCES environment(id) ON DELETE CASCADE,
      path TEXT NOT NULL,
      content TEXT NOT NULL,
      version INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(environment_id, path)
    );
  `);

  await executeQuery(`
    CREATE TABLE IF NOT EXISTS secret_version (
      id SERIAL PRIMARY KEY,
      secret_id INTEGER REFERENCES secret(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      version INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(secret_id, version)
    );
  `);

  await executeQuery(`
    CREATE TABLE IF NOT EXISTS collaborator (
      id SERIAL PRIMARY KEY,
      profile_id INTEGER REFERENCES profile(id) ON DELETE CASCADE,
      project_id INTEGER REFERENCES project(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'editor',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(profile_id, project_id)
    );
  `);

  await executeQuery(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id SERIAL PRIMARY KEY,
      profile_id INTEGER REFERENCES profile(id) ON DELETE CASCADE,
      project_id INTEGER REFERENCES project(id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      metadata JSONB DEFAULT '{}'::JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("✅ Database initialized");
};
