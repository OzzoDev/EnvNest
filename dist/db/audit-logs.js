"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const auditLogs = {
    create: async (githubId, secretId, secret_version_id, action, metaData = {}) => {
        const db = await (0, _1.getDbClient)();
        const profileId = await db.profiles.findId(githubId);
        if (!profileId) {
            return null;
        }
        return (await (0, _1.executeQuery)(`
          INSERT INTO audit_log (profile_id, secret_id, secret_version_id, action, metadata)
          SELECT $1, $2, $3, $4, $5
          WHERE EXISTS (
            SELECT 1 FROM secret_version WHERE id = $3
          )
        `, [profileId, secretId, secret_version_id, action, metaData]))[0];
    },
};
exports.default = auditLogs;
