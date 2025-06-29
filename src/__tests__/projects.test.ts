// import { createInnerTRPCContext } from "@/trpc/context";
// import { appRouter } from "@/trpc";
// import { describe, it } from "vitest";
// import { getDbClient } from "@/lib/db/models";

// describe("project creation with real DB", () => {
//   it("creates project", async () => {
//     const session = { user: { id: 159715008 } } as any;

//     const ctx = createInnerTRPCContext({
//       session,
//       db: getDbClient(),
//     });

//     const caller = appRouter.createCaller(ctx);

//     const input = {
//       repo_id: 1,
//       name: "test",
//       full_name: "test",
//       owner: "OzzoDev",
//       url: "url",
//       isPrivate: false,
//     };
//     const result = await caller.project.create(input);

//     expect(result).toHaveProperty("id");
//   });
// });
