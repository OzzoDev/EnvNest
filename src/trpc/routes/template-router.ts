import { getDbClient } from "@/lib/db/models";
import { privateProcedure, publicProcedure, router } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const templateRouter = router({
  getPublic: publicProcedure.query(async () => {
    const db = await getDbClient();

    return db.template.getPublic();
  }),
  create: privateProcedure
    .input(
      z.object({
        name: z.string(),
        template: z.string(),
        visibility: z.enum(["private", "organization"]),
      })
    )
    .mutation(async ({ input }) => {
      const { name, template, visibility } = input;

      const db = await getDbClient();

      const createdTemplate = await db.template.create(name, template, visibility);

      if (!createdTemplate) {
        throw new TRPCError({ code: "CONFLICT", message: "Template name must be unique" });
      }

      return createdTemplate;
    }),
});
