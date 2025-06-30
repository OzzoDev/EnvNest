import { AuditLogTable, AuditLogWithUser } from "@/types/types";
import { executeQuery } from "../db";
import profileModel from "./profile";

const auditLog = {
  get: async (secretId: number): Promise<AuditLogWithUser[]> => {
    return await executeQuery<AuditLogWithUser>(
      `
        SELECT 
          al.id, 
          al.profile_id,
          al.secret_id, 
          al.secret_version_id,
          al.action, 
          al.metadata, 
          al.created_at AT TIME ZONE 'UTC' AS created_at, 
          p.username AS user,
          sv.content
        FROM audit_log al
        INNER JOIN profile p 
          ON p.id = al.profile_id
        INNER JOIN secret_version sv
          ON sv.id = al.secret_version_id
        WHERE al.secret_id = $1                      
      `,
      [secretId]
    );
  },
  create: async <T>(
    githubId: string,
    secretId: number,
    secret_version_id: number,
    action: string,
    metaData: Record<string, T> = {}
  ): Promise<AuditLogTable | null> => {
    const profileId = (await profileModel.getByField({ github_id: githubId }))
      ?.id;

    if (!profileId) {
      return null;
    }

    return (
      await executeQuery<AuditLogTable>(
        `
          INSERT INTO audit_log (profile_id, secret_id, secret_version_id, action, metadata)
          SELECT $1, $2, $3, $4, $5
          WHERE EXISTS (
            SELECT 1 FROM secret_version WHERE id = $3
          )
          RETURNING *
        `,
        [profileId, secretId, secret_version_id, action, metaData]
      )
    )[0];
  },
};

export default auditLog;
