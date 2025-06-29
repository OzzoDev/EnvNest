import { createInnerTRPCContext } from "@/trpc/context";
import { appRouter } from "@/trpc";
import { getDbClient } from "@/lib/db/models";
import { beforeAll, describe, expect, it } from "vitest";
import { generateAESKey, aesEncrypt } from "@/lib/aes-helpers";

beforeAll(async () => {
  const db = await getDbClient();

  const createdProjected = await db.project.addProject({
    profile_id: 1,
    repo_id: 2,
    name: "test",
    full_name: "test",
    owner: "user",
    url: "url",
    private: false,
  });

  const projectId = createdProjected.id;

  const encryptionKey = generateAESKey().hex;

  await db.project.addKey(
    projectId,
    aesEncrypt(encryptionKey, process.env.ENCRYPTION_ROOT_KEY!)
  );
});

describe("secret creation with real DB", () => {
  it("creates secret", async () => {
    const session = { user: { id: 1234 } } as any;

    const ctx = createInnerTRPCContext({
      session,
      db: getDbClient(),
    });

    const caller = appRouter.createCaller(ctx);

    const input = { projectId: 1, path: "./", environment: "development" };

    const result = await caller.secret.create(input);

    console.log("secret crreation result: ", result);

    expect(typeof result).toBe("number");
  });
});
