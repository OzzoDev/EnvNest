import { dropTables, initDB } from "@/lib/db/db";

export default async function setup() {
  await dropTables();
  await initDB();
}
