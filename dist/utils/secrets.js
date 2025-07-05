"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncSecrets = exports.getSecrets = void 0;
const axios_1 = __importDefault(require("axios"));
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
const syncSecrets = async (projectId, secrets) => {
    const config = await (0, config_1.loadConfig)();
    const userId = config?.userId;
    const accessToken = config?.token;
    if (!userId || !accessToken) {
        throw new Error("userId and accessToken are required");
    }
    await axios_1.default.post("http://localhost:3000/api/auth/cli/secrets", { secrets }, {
        params: { userId, accessToken, projectId },
    });
};
exports.syncSecrets = syncSecrets;
