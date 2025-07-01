"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadSecrets = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const loadSecrets = async (secrets) => {
    const cwd = process.cwd();
    for (const secret of secrets) {
        const absolutePath = path_1.default.resolve(cwd, secret.path);
        try {
            const stats = await fs_1.default.promises.stat(absolutePath);
            if (!stats.isDirectory()) {
                const relativePath = path_1.default.relative(cwd, absolutePath);
                console.log(`❌ Path is not a directory: ${relativePath}. Skipping.`);
                continue;
            }
        }
        catch {
            const relativePath = path_1.default.relative(cwd, absolutePath);
            console.log(`❌ Path does not exist: ${relativePath}. Skipping.`);
            continue;
        }
        const fileName = secret.environment === "production" ? ".prod.env" : ".env";
        const fullFilePath = path_1.default.join(absolutePath, fileName);
        try {
            const formattedContent = secret.content
                .split("&&")
                .map((line) => line.trim())
                .filter(Boolean)
                .join("\n");
            await fs_1.default.promises.writeFile(fullFilePath, formattedContent, "utf-8");
            const relativePath = path_1.default.relative(cwd, absolutePath).trim() || "./";
            console.log(`✅ Successfully installed env file at: ${relativePath}`);
        }
        catch (err) {
            const relativePath = path_1.default.relative(cwd, absolutePath).trim() || "./";
            console.log(`❌ Failed to write env file at: ${relativePath}`, err);
        }
    }
};
exports.loadSecrets = loadSecrets;
