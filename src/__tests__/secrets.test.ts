import { createInnerTRPCContext } from "@/trpc/context";
import { appRouter } from "@/trpc";
import { describe, it } from "vitest";
import { getDbClient } from "@/lib/db/models";

describe("secret creation with real DB", () => {
  it("creates secret", async () => {
    const session = { user: { id: 159715008 } } as any;

    const ctx = createInnerTRPCContext({
      session,
      db: getDbClient(),
    });
    const caller = appRouter.createCaller(ctx);

    const input = { projectId: 1, path: "./", environment: "development" };
    const result = await caller.secret.create(input);

    expect(result).toHaveProperty("id");
  });
});
