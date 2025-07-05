"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncSecrets = exports.getSecrets = void 0;
const axios_1 = __importDefault(require("axios"));
const _1 = require(".");
const db_1 = require("../db");
const config_1 = require("../config/config");
const getSecrets = async (projectId) => {
    const config = await (0, config_1.loadConfig)();
    const userId = config?.userId;
    const accessToken = config?.token;
    if (!userId || !accessToken) {
        throw new Error("userId and accessToken are required");
    }
    const { data } = await axios_1.default.get("http://localhost:3000/api/auth/cli/secrets", {
        params: { userId, accessToken, projectId },
    });
    return (data.secrets.map((secret) => ({
        id: secret.id,
        path: secret.path,
        environment: secret.environment,
        content: secret.content,
    })) || []);
};
exports.getSecrets = getSecrets;
const syncSecrets = async (projectId, userId, secrets) => {
    const db = await (0, db_1.getDbClient)();
    const projectKey = await db.projects.findKey(projectId, userId);
    if (!projectKey) {
        console.log("Project key not found");
        process.exit(1);
    }
    const decryptedKey = (0, _1.aesDecrypt)(projectKey, "");
    await Promise.all(secrets.map((secret) => db.secrets.update(userId, secret.id, (0, _1.aesEncrypt)(secret.content, decryptedKey))));
};
exports.syncSecrets = syncSecrets;
