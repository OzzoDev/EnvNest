import { beforeAll, beforeEach, afterEach, afterAll } from "vitest";
import type { PoolClient } from "pg";
import { initDB, pool, seedDB } from "@/lib/db/db";

let client: PoolClient | null = null;

beforeAll(async () => {
  await initDB();
  await seedDB();
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
