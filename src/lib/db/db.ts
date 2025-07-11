import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const sanitizeValues = (values: unknown[]) => {
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
    CREATE TABLE IF NOT EXISTS access_token (
      profile_id INTEGER REFERENCES profile(id) ON DELETE CASCADE PRIMARY KEY,
      access_token TEXT NOT NULL
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
      role TEXT NOT NULL DEFAULT 'viewer',
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
      private BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(profile_id, name)
    );
  `);

  await executeQuery(`
    CREATE TABLE IF NOT EXISTS org_project (
      project_id INTEGER REFERENCES project(id) ON DELETE CASCADE,
      org_id INTEGER REFERENCES org(id) ON DELETE CASCADE,
      PRIMARY KEY (project_id, org_id)
    )  
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await executeQuery(`
    CREATE TABLE IF NOT EXISTS secret (
      id SERIAL PRIMARY KEY,
      environment_id INTEGER REFERENCES environment(id) ON DELETE CASCADE,
      path TEXT NOT NULL,
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
    CREATE TABLE IF NOT EXISTS secret_active (
      id SERIAL PRIMARY KEY, 
      profile_id INTEGER REFERENCES profile(id) ON DELETE CASCADE,
      project_id INTEGER REFERENCES project(id) ON DELETE CASCADE,
      secret_id INTEGER REFERENCES secret(id) ON DELETE CASCADE,
      UNIQUE(profile_id, project_id, secret_id)
    );  
  `);

  await executeQuery(`
    CREATE TABLE IF NOT EXISTS secret_history (
      id SERIAL PRIMARY KEY, 
      profile_id INTEGER REFERENCES profile(id) ON DELETE CASCADE,
      secret_id INTEGER REFERENCES secret(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (profile_id, secret_id)
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
      secret_version_id INTEGER REFERENCES secret_version(id) ON DELETE CASCADE,
      secret_id INTEGER REFERENCES secret(id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      metadata JSONB DEFAULT '{}'::JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await executeQuery(`
    CREATE TABLE IF NOT EXISTS template (
      id SERIAL PRIMARY KEY, 
      profile_id INTEGER REFERENCES profile(id) ON DELETE CASCADE,
      name TEXT NOT NULL UNIQUE,
      template TEXT NOT NULL,
      visibility TEXT NOT NULL
    )  
  `);

  await seedDB();
};

export const dropTables = async () => {
  const tables = [
    "secret_history",
    "secret_active",
    "secret_version",
    "secret",
    "environment",
    "project_key",
    "org_project",
    "project",
    "org_profile",
    "org",
    "profile",
    "collaborator",
    "audit_log",
    "template",
  ];

  for (const table of tables) {
    try {
      await executeQuery(`DROP TABLE IF EXISTS ${table} CASCADE;`);
    } catch (error) {
      // console.error(`Failed to drop ${table}:`, error);
      throw error;
    }
  }
};

export const seedDB = async () => {
  const result = await executeQuery<{ count: number }>(
    `SELECT CAST(COUNT(*) AS INTEGER) FROM template`
  );

  if (!result[0].count || result[0].count === 0) {
    try {
      await executeQuery(`
        INSERT INTO template (name, template, visibility)
        SELECT 'Node.js', 'PORT=3000&&NODE_ENV=development&&JWT_SECRET=1234&&DB_URL=mongodb://localhost:27017/mydb&&API_KEY=abcd1234', 'public'
          UNION ALL
        SELECT 'React', 'REACT_APP_API_URL=https://api.example.com&&NODE_ENV=development&&JWT_SECRET=abcd&&API_KEY=reactkey', 'public'
          UNION ALL
        SELECT 'Next.js', 'NEXT_PUBLIC_API_URL=https://api.example.com&&NODE_ENV=development&&JWT_SECRET=efgh&&DB_URL=postgres://user:pass@localhost:5432/mydb', 'public'
          UNION ALL
        SELECT 'Vue.js', 'VUE_APP_API_URL=https://api.example.com&&NODE_ENV=development&&JWT_SECRET=ijkl&&DB_URL=mysql://user:pass@localhost:3306/mydb', 'public'
          UNION ALL
        SELECT 'Angular', 'API_URL=https://api.example.com&&NODE_ENV=development&&JWT_SECRET=mnop&&DB_URL=sqlite://mydb.sqlite&&MAILGUN_API_KEY=mailgunkey', 'public'
          UNION ALL
        SELECT 'Django', 'DJANGO_SECRET_KEY=secretkey&&DEBUG=True&&ALLOWED_HOSTS=localhost&&DATABASE_URL=postgres://user:pass@localhost:5432/mydb', 'public'
          UNION ALL
        SELECT 'Flask', 'FLASK_ENV=development&&SECRET_KEY=flasksecret&&DATABASE_URL=mysql://user:pass@localhost:3306/mydb&&MAILGUN_API_KEY=flaskmailgun', 'public'
          UNION ALL
        SELECT 'Ruby on Rails', 'RAILS_ENV=development&&SECRET_KEY_BASE=railssecret&&DATABASE_URL=sqlite://db/development.sqlite3&&REDIS_URL=redis://localhost:6379', 'public'
          UNION ALL
        SELECT 'Spring Boot', 'SERVER_PORT=8080&&SPRING_PROFILES_ACTIVE=dev&&JWT_SECRET=springsecret&&DB_URL=jdbc:mysql://localhost:3306/mydb&&MAIL_SERVICE=mailgun', 'public'
          UNION ALL
        SELECT 'Laravel', 'APP_ENV=local&&APP_KEY=base64:laravelsecret&&DB_URL=mysql://user:pass@localhost:3306/mydb&&MAIL_MAILER=smtp', 'public';
        `);
    } catch (error) {
      console.error("Error seeding database: ", error);
    }
  }
};
