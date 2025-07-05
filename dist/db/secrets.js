"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const secrets = {
    find: async (projectId) => {
        return await (0, _1.executeQuery)(`
          WITH latest_version AS (
            SELECT DISTINCT ON (secret_id)
              id,
              secret_id,
              content,
              version,
              created_at
            FROM secret_version
            ORDER BY secret_id, version DESC
          )
          SELECT
            s.id,
            s.path,
            lv.content,
            e.name as environment
          FROM project p
          INNER JOIN environment e
            ON e.project_id = p.id
          INNER JOIN secret s
            ON s.environment_id = e.id
          INNER JOIN latest_version lv
            ON lv.secret_id = s.id
          WHERE p.id = $1
        `, [projectId]);
    },
    update: async (userId, secretId, content) => {
        try {
            await (0, _1.executeQuery)(`BEGIN`);
            await (0, _1.executeQuery)(`
          SELECT * FROM secret
          WHERE id = $1
          FOR UPDATE
        `, [secretId]);
            const secretVersionId = (await (0, _1.executeQuery)(`
          INSERT INTO secret_version (secret_id, content, version)
          SELECT $1, $2, COALESCE(MAX(version), 0) + 1
          FROM secret_version
          WHERE secret_id = $1
          RETURNING id;
        `, [secretId, content]))[0]?.id ?? null;
            await (0, _1.executeQuery)(`
          UPDATE secret
          SET updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [secretId]);
            const db = await (0, _1.getDbClient)();
            await db.auditLogs.create(userId, secretId, secretVersionId, "Synced with CLI", { type: "CLI" });
            await (0, _1.executeQuery)(`COMMIT`);
        }
        catch (err) {
            await (0, _1.executeQuery)(`ROLLBACK`);
            return null;
        }
    },
};
exports.default = secrets;
