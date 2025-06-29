import { pool } from "@/lib/db/db";
import { getDbClient } from "@/lib/db/models";
import type { PoolClient } from "pg";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";

let client: PoolClient | null = null;

beforeAll(async () => {
  const db = await getDbClient();

  await db.profile.create({ github_id: "1234", username: "user" });
});

beforeEach(async () => {
  client = await pool.connect();
  await client.query("BEGIN");
});

afterEach(async () => {
  if (client) {
    await client.query("ROLLBACK");
    client.release();
    client = null;
  }
});

afterAll(async () => {
  await pool.end();
});
