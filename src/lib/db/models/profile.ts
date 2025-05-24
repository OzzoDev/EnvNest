import { GithubUser, GithubUserNoId, Profile } from "../../../../types/types";
import { executeQuery } from "../db";

const profile = {
  getByField: async <K extends keyof Profile>(
    where: Record<K, Profile[K]>
  ): Promise<Profile | undefined> => {
    const key = Object.keys(where)[0] as K;
    const value = where[key];

    const result = await executeQuery<Profile>(`SELECT * FROM profile WHERE ${key} = $1`, [value]);

    return result[0];
  },

  create: async (user: GithubUser): Promise<Profile> => {
    const entries = Object.entries(user).filter(([_, value]) => value !== undefined);
    const keys = entries.map(([key]) => key).join(", ");
    const placeholders = entries.map((_, i) => `$${i + 1}`).join(", ");
    const values = entries.map(([_, value]) => value);

    const result = await executeQuery<Profile>(
      `
        INSERT INTO profile (${keys})
        VALUES (${placeholders})
        ON CONFLICT (github_id) DO NOTHING
        RETURNING *;
      `,
      values
    );

    return result[0];
  },

  update: async <K extends keyof Profile>(
    user: GithubUserNoId,
    whereKey: K,
    whereValue: Profile[K]
  ): Promise<Profile> => {
    const entries = Object.entries(user).filter(([_, value]) => value !== undefined);
    const setClause = entries.map(([key], i) => `${key} = $${i + 1}`).join(", ");
    const values = entries.map(([_, value]) => value);

    const whereParamIndex = values.length + 1;

    const result = await executeQuery<Profile>(
      `
        UPDATE profile
        SET ${setClause}
        WHERE ${whereKey} = $${whereParamIndex}
        RETURNING *;
      `,
      [...values, whereValue]
    );

    return result[0];
  },

  upsert: async <K extends keyof Profile>(
    where: Record<K, Profile[K]>,
    update: GithubUserNoId,
    create: GithubUser
  ): Promise<Profile> => {
    const existing = await profile.getByField(where);

    const key = Object.keys(where)[0] as K;
    const value = where[key];

    if (existing) {
      return await profile.update(update, key, value);
    }

    return await profile.create(create);
  },
};

export default profile;
