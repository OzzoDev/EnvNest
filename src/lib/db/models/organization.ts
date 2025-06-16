import { OrgProfileTable, OrgTable } from "@/types/types";
import { executeQuery } from "../db";

const organization = {
  create: async (profileId: number, name: string): Promise<OrgTable | null> => {
    try {
      await executeQuery("BEGIN");

      const org = (
        await executeQuery<OrgTable>(
          `
            INSERT INTO org (name)
            VALUES ($1)
            ON CONFLICT (name) DO NOTHING
            RETURNING *;    
          `,
          [name]
        )
      )[0];

      if (!org) {
        return null;
      }

      await executeQuery<OrgProfileTable>(
        `
            INSERT INTO org_profile (org_id, profile_id, role)
            VALUES ($1, $2, $3)
            RETURNING *;    
        `,
        [org.id, profileId, "admin"]
      );

      await executeQuery("COMMIT");

      return org ?? null;
    } catch {
      await executeQuery("ROLLBACK");
      return null;
    }
  },
};

export default organization;
