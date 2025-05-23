import { GithubUser, Profile } from "@/lib/types";
import { executeQuery } from "../db";

const profile = {
  create: async function (user: GithubUser): Promise<Profile> {
    const result = await executeQuery<Profile>(
      `
        INSERT INTO profile (email, name, image)
        VALUES ($1, $2, $3)
        ON CONFLICT (email) DO NOTHING
        RETURNING *;  
    `,
      [user.email, user.name, user.image]
    );

    return result[0];
  },
};

export default profile;
