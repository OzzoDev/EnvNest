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

  await executeQuery(`
    CREATE TABLE IF NOT EXISTS template (
      id SERIAL PRIMARY KEY, 
      name TEXT NOT NULL UNIQUE,
      template TEXT NOT NULL,
      visibility TEXT NOT NULL
    )  
  `);

  console.log("✅ Database initialized");

  await seedDB();
};

const seedDB = async () => {
  const result = await executeQuery(`SELECT COUNT(*) FROM template`);

  if (result.length === 0) {
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
      console.log("✅ Database seeded");
    } catch (error) {
      console.error("Error seeding database: ", error);
    }
  } else {
    console.log("✅ Database already seeded, no changes made.");
  }
};
