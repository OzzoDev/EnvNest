import { getDbClient } from "@/lib/db/models";
import { describe, expect, it } from "vitest";

describe("handle user login", () => {
  it("should login in user", async () => {
    const db = await getDbClient();

    const profile = await db.profile.create({
      github_id: "1111",
      username: "test",
    });

    expect(profile).toHaveProperty("id");
  });

  it("should not login in user with alredy taken username", async () => {
    const db = await getDbClient();

    let profile;

    try {
      profile = await db.profile.create({
        github_id: "2222",
        username: "test",
      });
    } catch {
      profile = null;
    }

    expect(profile).toBeFalsy();
  });
});
