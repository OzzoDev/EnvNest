import { getDbClient } from "@/lib/db/models";
import { privateProcedure, router } from "../trpc";

export const profileRouter = router({
  getAll: privateProcedure.query(async () => {
    try {
      const db = await getDbClient();

      return await db.profile.getAll();
    } catch (err) {
      console.log(err);
    }
  }),
});
