import { getDbClient } from "@/lib/db/models";
import { Profile } from "@/types/types";

export const getProfiles = async (): Promise<Profile[]> => {
  try {
    const db = await getDbClient();

    return await db.profile.getAll();
  } catch (err) {
    console.error("Error fetching profiles", err);
    throw err;
  }
};
