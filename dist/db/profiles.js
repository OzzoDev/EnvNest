"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const profiles = {
    findId: async (userId) => {
        return ((await (0, _1.executeQuery)(`
            SELECT id
            FROM profile
            WHERE github_id = $1
        `, [userId]))[0]?.id ?? null);
    },
};
exports.default = profiles;
