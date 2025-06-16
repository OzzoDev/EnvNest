import { OrgProfileTable, OrgTable, OrgWithRole } from "@/types/types";
import { executeQuery } from "../db";

const organization = {
  get: async (profileId: number): Promise<OrgWithRole[]> => {
    return await executeQuery<OrgWithRole>(
      `
        SELECT
            o.id,
            o.name, 
            o.created_at, 
            op.role
        FROM org o
        INNER JOIN org_profile op
            ON op.org_id = o.id
        WHERE o.id = $1    
      `,
      [profileId]
    );
  },
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
