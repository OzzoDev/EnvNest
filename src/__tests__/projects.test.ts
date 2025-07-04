import { createInnerTRPCContext } from "@/trpc/context";
import { appRouter } from "@/trpc";
import { getDbClient } from "@/lib/db/models";
import { beforeAll, describe, expect, it } from "vitest";
import { Session } from "next-auth";

beforeAll(async () => {
  const db = await getDbClient();

  await db.organization.create(1, "org");
});

describe("project creation with real DB", () => {
  it("creates project", async () => {
    const session = { user: { id: 1234 } } as Session;

    const ctx = createInnerTRPCContext({
      session,
      db: getDbClient(),
    });

    const caller = appRouter.createCaller(ctx);

    const input = {
      repo_id: 1,
      name: "my project",
      full_name: "test",
      owner: "testUser",
      url: "url",
      isPrivate: false,
    };

    const result = await caller.project.create(input);

    expect(result).toHaveProperty("id");
  });

  it("should not create project with unauthenticated user", async () => {
    const session = { user: { id: 9999 } } as Session;

    const ctx = createInnerTRPCContext({
      session,
      db: getDbClient(),
    });

    const caller = appRouter.createCaller(ctx);

    let result;

    const input = {
      repo_id: 1,
      name: "my project",
      full_name: "test",
      owner: "testUser",
      url: "url",
      isPrivate: false,
    };

    try {
      result = await caller.project.create(input);
    } catch {
      result = null;
    }

    expect(result).toBeFalsy();
  });

  it("creates project in organization", async () => {
    const session = { user: { id: 1234 } } as Session;

    const ctx = createInnerTRPCContext({
      session,
      db: getDbClient(),
    });

    const caller = appRouter.createCaller(ctx);

    const input = {
      repo_id: 5,
      name: "my test project",
      full_name: "my repo",
      owner: "testUser",
      url: "url",
      isPrivate: false,
      orgId: 1,
    };

    const result = await caller.project.create(input);

    expect(result).toHaveProperty("id");
  });

  it("deletes project", async () => {
    const session = { user: { id: 1234 } } as Session;

    const ctx = createInnerTRPCContext({
      session,
      db: getDbClient(),
    });

    const caller = appRouter.createCaller(ctx);

    const result = await caller.project.delete({ projectId: 1 });

    expect(result).toHaveProperty("id");
  });

  it("delete project should be protected", async () => {
    const session = { user: { id: 3333 } } as Session;

    const ctx = createInnerTRPCContext({
      session,
      db: getDbClient(),
    });

    const caller = appRouter.createCaller(ctx);

    let result;

    try {
      result = await caller.project.delete({ projectId: 1 });
    } catch {
      result = null;
    }
    expect(result).toBeFalsy();
  });
});
