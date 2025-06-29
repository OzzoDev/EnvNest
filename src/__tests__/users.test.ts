import { getDbClient } from "@/lib/db/models";
import { describe, expect, it } from "vitest";

describe("handle user login", () => {
  it("should login in user", async () => {
    const db = await getDbClient();

    const profile = await db.profile.create({
      github_id: "1234",
      username: "user",
    });

    console.log("Profile: ", profile);

    expect(profile).toHaveProperty("id");
  });
});
