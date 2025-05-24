import { GithubUser, Profile } from "@/lib/types";
import { executeQuery } from "../db";

const profile = {
  create: async function (user: GithubUser): Promise<Profile> {
    const values = Object.values(user).filter(Boolean);
    const keys = Object.keys(user)
      .map((key, index) => (index === values.length - 1 ? `${key}` : `${key}, `))
      .join("");
    const placeHolders = values
      .map((_, index) => (index === values.length - 1 ? `$${index + 1}` : `$${index + 1}, `))
      .join("");

    const result = await executeQuery<Profile>(
      `
        INSERT INTO profile (${keys})
        VALUES (${placeHolders})
        ON CONFLICT (name) DO NOTHING
        RETURNING *;  
    `,
      values
    );

    return result[0];
  },
};

export default profile;
