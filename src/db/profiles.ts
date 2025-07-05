import { executeQuery } from ".";

const profiles = {
  findId: async (userId: string) => {
    return (
      (
        await executeQuery<{ id: number }>(
          `
            SELECT id
            FROM profile
            WHERE github_id = $1
        `,
          [userId]
        )
      )[0]?.id ?? null
    );
  },
};

export type ProfilesType = typeof profiles;

export default profiles;
