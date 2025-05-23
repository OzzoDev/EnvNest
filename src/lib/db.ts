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

export const executeQuery = async (queryText: string, values: any[] = []) => {
  const sanitizedValues = sanitizeValues(values);
  const client = await pool.connect();

  try {
    const response = await client.query(queryText, sanitizedValues);
    return response.rows;
  } catch (err) {
    console.error("Database query error:", err);
    throw err;
  } finally {
    client.release();
  }
};

async function initDB() {
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS profile (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      image TEXT
    );
  `);
  console.log("✅ Database initialized");
}

initDB().catch(console.error);
