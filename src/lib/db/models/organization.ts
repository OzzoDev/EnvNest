import { Org, OrgProfileTable, OrgRole, OrgTable, OrgWithRole } from "@/types/types";
import { executeQuery } from "../db";

const organization = {
  get: async (profileId: number): Promise<Org[]> => {
    return await executeQuery<Org>(
      `
        SELECT
            o.id,
            o.name, 
            o.created_at, 
            op.role,
            (
                SELECT json_agg(json_build_object('role',orp.role, 'name', p.username, 'profile_id', orp.profile_id))
                FROM org_profile orp
                INNER JOIN profile p
                    ON p.id = orp.profile_id
                WHERE orp.org_id = o.id AND p.id != $1
            ) AS members
        FROM org o
        LEFT JOIN org_profile op
            ON op.org_id = o.id
        WHERE op.profile_id = $1
      `,
      [profileId]
    );
  },
  getMember: async (profileId: number, orgId: number): Promise<OrgProfileTable | null> => {
    return (
      (
        await executeQuery<OrgProfileTable>(
          `
            SELECT *
            FROM org_profile
            WHERE profile_id = $1 AND org_id = $2    
          `,
          [profileId, orgId]
        )
      )[0] ?? null
    );
  },
  isOrgAdmin: async (profileId: number, orgId: number): Promise<boolean> => {
    return !!(await executeQuery(
      `
        SELECT
            id
        FROM org_profile
        WHERE profile_id = $1 AND org_id = $2 AND role = 'admin'    
    `,
      [profileId, orgId]
    ));
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
  addMember: async (
    profileId: number,
    orgId: number,
    role: OrgRole
  ): Promise<OrgProfileTable | null> => {
    return (
      (
        await executeQuery<OrgProfileTable>(
          `
            INSERT INTO org_profile (profile_id, org_id, role)
            VALUES ($1, $2, $3)
            ON CONFLICT (org_id, profile_id) DO NOTHING
            RETURNING *;    
          `,
          [profileId, orgId, role]
        )
      )[0] ?? null
    );
  },
  update: async (orgId: number, name: string): Promise<OrgTable | null> => {
    try {
      return (
        (
          await executeQuery<OrgTable>(
            `
                UPDATE org
                SET name = $1
                WHERE id = $2
                RETURNING *;   
            `,
            [name, orgId]
          )
        )[0] ?? null
      );
    } catch {
      return Promise.resolve(null);
    }
  },
  updateMemberRole: async (
    profileId: number,
    orgId: number,
    role: OrgRole
  ): Promise<OrgProfileTable | null> => {
    return (
      (
        await executeQuery<OrgProfileTable>(
          `
            UPDATE org_profile
            SET role = $1
            WHERE org_id = $2 AND profile_id = $3
            RETURNING *;    
          `,
          [role, orgId, profileId]
        )
      )[0] ?? null
    );
  },
  delete: async (orgId: number): Promise<OrgTable | null> => {
    return (
      (
        await executeQuery<OrgTable>(
          `
            DELETE FROM org
            WHERE id = $1  
            RETURNING *;   
          `,
          [orgId]
        )
      )[0] ?? null
    );
  },
  deleteMember: async (profileId: number, orgId: number): Promise<OrgProfileTable | null> => {
    return (
      (
        await executeQuery<OrgProfileTable>(
          `
            DELETE FROM org_profile
            WHERE org_id = $1 AND profile_id = $2
            RETURNING *;    
          `,
          [orgId, profileId]
        )
      )[0] ?? null
    );
  },
  leave: async (profileId: number, orgId: number): Promise<OrgProfileTable | null> => {
    return (
      (
        await executeQuery<OrgProfileTable>(
          `
            DELETE FROM org_profile
            WHERE profile_id = $1 AND org_id = $2
            RETURNING *;     
          `,
          [profileId, orgId]
        )
      )[0] ?? null
    );
  },
};

export default organization;
