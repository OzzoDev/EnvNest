import { getDbClient } from "@/lib/db/models";
import { publicProcedure, router } from "../trpc";

export const templateRouter = router({
  getPublic: publicProcedure.query(async () => {
    const db = await getDbClient();

    return db.template.getPublic();
  }),
});
