import { createInnerTRPCContext } from "@/trpc/context";
import { appRouter } from "@/trpc";
import { getDbClient } from "@/lib/db/models";
import { beforeAll, describe, expect, it } from "vitest";
import { generateAESKey, aesEncrypt } from "@/lib/aes-helpers";
import { executeQuery } from "@/lib/db/db";

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

  await db.secret.create(1, "development", "./src", "Some secret");
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

    expect(typeof result).toBe("number");
  });

  it("creates secret from template", async () => {
    const session = { user: { id: 1234 } } as any;

    const ctx = createInnerTRPCContext({
      session,
      db: getDbClient(),
    });

    const caller = appRouter.createCaller(ctx);

    const input = {
      projectId: 2,
      path: "./",
      environment: "development",
      templateId: 1,
    };

    const result = await caller.secret.create(input);

    expect(typeof result).toBe("number");
  });

  it("should not create secret with unauthenticated user", async () => {
    const session = { user: { id: 1235 } } as any;

    const ctx = createInnerTRPCContext({
      session,
      db: getDbClient(),
    });

    const caller = appRouter.createCaller(ctx);

    const input = { projectId: 1, path: "./", environment: "development" };

    let result;

    try {
      result = await caller.secret.create(input);
    } catch {
      result = null;
    }

    expect(result).toBeFalsy();
  });

  it("should not create secret with unauthtorized user", async () => {
    const db = await getDbClient();

    const tempUser = await db.profile.create({
      github_id: "1212",
      username: "notAllowedUser",
    });

    const session = { user: { id: tempUser.github_id } } as any;

    const ctx = createInnerTRPCContext({
      session,
      db: getDbClient(),
    });

    const caller = appRouter.createCaller(ctx);

    const input = { projectId: 1, path: "./", environment: "development" };

    let result;

    try {
      result = await caller.secret.create(input);
    } catch {
      result = null;
    }

    expect(result).toBeFalsy();
  });

  it("updates secret", async () => {
    const session = { user: { id: 1234 } } as any;

    const ctx = createInnerTRPCContext({
      session,
      db: getDbClient(),
    });

    const caller = appRouter.createCaller(ctx);

    const input = {
      projectId: 2,
      secretId: 3,
      content: "Updated secret",
      updateMessage: "Updated secret",
      type: "UPDATE",
    };

    const result = await caller.secret.update(input);

    expect(result).toHaveProperty("id");
  });

  it("should not update secret with unauthenticated user", async () => {
    const session = { user: { id: 1235 } } as any;

    const ctx = createInnerTRPCContext({
      session,
      db: getDbClient(),
    });

    const caller = appRouter.createCaller(ctx);

    const input = {
      projectId: 1,
      secretId: 1,
      content: "Updated secret",
      updateMessage: "Updated secret",
      type: "UPDATE",
    };

    let result;

    try {
      result = await caller.secret.update(input);
    } catch {
      result = null;
    }

    expect(result).toBeFalsy();
  });

  it("deletes secret", async () => {
    const session = { user: { id: 1234 } } as any;

    const ctx = createInnerTRPCContext({
      session,
      db: getDbClient(),
    });

    const caller = appRouter.createCaller(ctx);

    const input = {
      projectId: 2,
      secretId: 3,
    };

    const result = await caller.secret.delete(input);

    expect(result).toHaveProperty("id");
  });

  it("should not delete secret with unauthenticated user", async () => {
    const session = { user: { id: 1235 } } as any;

    const ctx = createInnerTRPCContext({
      session,
      db: getDbClient(),
    });

    const caller = appRouter.createCaller(ctx);

    const input = {
      projectId: 1,
      secretId: 1,
    };

    let result;

    try {
      result = await caller.secret.delete(input);
    } catch {
      result = null;
    }

    expect(result).toBeFalsy();
  });
});
