import { z } from "zod";
import { privateProcedure } from "../trpc";
import { getDbClient } from "@/lib/db/models";

export const auditLogRouter = {
  get: privateProcedure.input(z.object({ secretId: z.number() })).query(async ({ input }) => {
    const { secretId } = input;

    const db = await getDbClient();

    return await db.auditLog.get(secretId);
  }),
};
