"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecrets = void 0;
const _1 = require(".");
const db_1 = require("../db");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ENCRYPTION_ROOT_KEY = process.env.ENCRYPTION_ROOT_KEY;
if (!ENCRYPTION_ROOT_KEY) {
    throw new Error("Missing ENCRYPTION_ROOT_KEY in .env file");
}
const getSecrets = async (projectId, userId) => {
    const db = await (0, db_1.getDbClient)();
    const projectKey = await db.projects.findKey(projectId, userId);
    if (!projectKey) {
        console.log("Project key not found");
        process.exit(1);
    }
    const decryptedKey = (0, _1.aesDecrypt)(projectKey, ENCRYPTION_ROOT_KEY);
    const secrets = await db.secrets.find(projectId);
    const decryptedSecrets = secrets.map((secret) => {
        const decryptedContent = (0, _1.aesDecrypt)(secret.content, decryptedKey);
        return { ...secret, content: decryptedContent };
    });
    return decryptedSecrets;
};
exports.getSecrets = getSecrets;
