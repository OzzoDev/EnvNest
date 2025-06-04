import { AuditLogTable } from "@/types/types";
import { executeQuery } from "../db";

const auditLog = {
  get: async (secretId: number): Promise<AuditLogTable> => {
    return (
      await executeQuery<AuditLogTable>(
        `
        SELECT * 
        FROM audit_log
        WHERE secret_id = $1                      
    `,
        [secretId]
      )
    )[0];
  },
  create: async <T>(
    profileId: number,
    secretId: number,
    secret_version_id: number,
    action: string,
    metaData: Record<string, T> = {}
  ): Promise<AuditLogTable> => {
    return (
      await executeQuery<AuditLogTable>(
        `
            INSERT INTO audit_log (profile_id, secret_id, secret_version_id, action, metadata)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *    
        `,
        [profileId, secretId, secret_version_id, action, metaData]
      )
    )[0];
  },
};

export default auditLog;
