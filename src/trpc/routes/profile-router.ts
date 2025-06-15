import { getDbClient } from "@/lib/db/models";
import { privateProcedure, router } from "../trpc";
import { z } from "zod";

export const profileRouter = router({
  get: privateProcedure.query(async () => {
    const db = await getDbClient();

    return await db.profile.get();
  }),
  searchOne: privateProcedure.input(z.string()).query(async ({ input }) => {
    const db = await getDbClient();

    return await db.profile.searchOne(input);
  }),
});
