import { z } from "zod";
import { privateProcedure, router } from "../trpc";
import { getDbClient } from "@/lib/db/models";
import { aesDecrypt, aesEncrypt } from "@/lib/aes-helpers";

export const secretRouter = router({
  updateVersion: privateProcedure
    .input(z.object({ secretId: z.number(), projectId: z.number(), content: z.string() }))
    .mutation(async ({ input }) => {
      const { secretId, projectId, content } = input;

      const db = await getDbClient();

      const projectKey = (await db.project.getKey(projectId)).encrypted_key;

      console.log("Proejct key: ", projectKey);

      console.log("Root key ", process.env.ENCRYPTION_ROOT_KEY!);

      const decryptedKey = aesDecrypt(projectKey, process.env.ENCRYPTION_ROOT_KEY!);

      const encryptedContent = aesEncrypt(content, decryptedKey);

      return db.secret.updateVersion(secretId, encryptedContent);
    }),
});
