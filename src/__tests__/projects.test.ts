import { createInnerTRPCContext } from "@/trpc/context";
import { appRouter } from "@/trpc";
import { getDbClient } from "@/lib/db/models";
import { describe, expect, it } from "vitest";

describe("project creation with real DB", () => {
  it("creates project", async () => {
    const session = { user: { id: 1234 } } as any;

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
});
