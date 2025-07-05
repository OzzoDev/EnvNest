import { executeQuery, getDbClient } from ".";

const auditLogs = {
  create: async <T>(
    githubId: string,
    secretId: number,
    secret_version_id: number,
    action: string,
    metaData: Record<string, T> = {}
  ) => {
    const db = await getDbClient();
    const profileId = await db.profiles.findId(githubId);

    if (!profileId) {
      return null;
    }

    return (
      await executeQuery(
        `
          INSERT INTO audit_log (profile_id, secret_id, secret_version_id, action, metadata)
          SELECT $1, $2, $3, $4, $5
          WHERE EXISTS (
            SELECT 1 FROM secret_version WHERE id = $3
          )
        `,
        [profileId, secretId, secret_version_id, action, metaData]
      )
    )[0];
  },
};

export type AuditLogsType = typeof auditLogs;

export default auditLogs;
