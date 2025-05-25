import { aesEncrypt, generateAESKey } from "../../lib/aes-helpers";
import { privateProcedure, router } from "../trpc";

export const aesRouter = router({
  getEncryptedProjectKey: privateProcedure.query(() => {
    return aesEncrypt(generateAESKey().hex, process.env.ENCRYPTION_ROOT_KEY!);
  }),
});
