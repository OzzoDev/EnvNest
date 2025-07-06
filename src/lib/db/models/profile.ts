import {
  AccessTokenTable,
  GithubUser,
  GithubUserNoId,
  Profile,
} from "@/types/types";
import { executeQuery } from "../db";

const profile = {
  get: async (): Promise<Profile[]> => {
    return await executeQuery<Profile>(`SELECT * FROM profile`);
  },
  getByField: async <K extends keyof Profile>(
    where: Record<K, Profile[K]>
  ): Promise<Profile | undefined> => {
    const key = Object.keys(where)[0] as K;
    const value = where[key];

    const result = await executeQuery<Profile>(
      `SELECT * FROM profile WHERE ${key} = $1`,
      [value]
    );

    return result[0];
  },
  searchOne: async (username: string): Promise<Profile | null> => {
    return (
      (
        await executeQuery<Profile>(
          `
            SELECT *
            FROM profile
            WHERE username ILIKE $1
          `,
          [`%${username}%`]
        )
      )[0] ?? null
    );
  },
  create: async (user: GithubUser): Promise<Profile> => {
    const entries = Object.entries(user).filter(
      ([_, value]) => value !== undefined
    );
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
  createAccessToken: async (github_id: string, accessToken: string) => {
    const profileId = (await profile.getByField({ github_id }))?.id;

    if (!profileId) {
      return null;
    }

    await executeQuery(
      `
        INSERT INTO access_token (profile_id, access_token)
        VALUES ($1, $2)
        ON CONFLICT (profile_id) DO UPDATE SET access_token = EXCLUDED.access_token
      `,
      [profileId, accessToken]
    );
  },
  getAccessToken: async (github_id: string): Promise<string | null> => {
    const profileId = (await profile.getByField({ github_id }))?.id;

    if (!profileId) {
      return null;
    }

    return (
      (
        await executeQuery<AccessTokenTable>(
          `
        SELECT *
        FROM access_token
        WHERE profile_id = $1
      `,
          [profileId]
        )
      )[0].access_token ?? null
    );
  },
  update: async <K extends keyof Profile>(
    user: GithubUserNoId,
    whereKey: K,
    whereValue: Profile[K]
  ): Promise<Profile> => {
    const entries = Object.entries(user).filter(
      ([_, value]) => value !== undefined
    );
    const setClause = entries
      .map(([key], i) => `${key} = $${i + 1}`)
      .join(", ");
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
