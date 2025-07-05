"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readSecrets = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const readSecrets = async (secrets) => {
    const cwd = process.cwd();
    const results = [];
    for (const secret of secrets) {
        const relativePath = secret.path.replace(/^[/\\]+/, "");
        const absolutePath = path_1.default.resolve(cwd, relativePath);
        const fileName = secret.environment === "production" ? ".prod.env" : ".env";
        const fullFilePath = path_1.default.join(absolutePath, fileName);
        try {
            const stats = await fs_1.default.promises.stat(fullFilePath);
            if (!stats.isFile()) {
                console.log(`❌ Not a file: ${path_1.default.relative(cwd, fullFilePath)}. Skipping.`);
                continue;
            }
        }
        catch {
            console.log(`❌ File not found: ${path_1.default.relative(cwd, fullFilePath)}. Skipping.`);
            continue;
        }
        try {
            const content = await fs_1.default.promises.readFile(fullFilePath, "utf-8");
            const formattedContent = content
                .split(/\r?\n/)
                .map((line) => line.trim())
                .filter(Boolean)
                .join("&&");
            results.push({
                id: secret.id,
                path: secret.path,
                environment: secret.environment,
                content: formattedContent,
            });
        }
        catch {
            console.log(`❌ Failed to read env file at: ${path_1.default.relative(cwd, fullFilePath)}`);
        }
    }
    return results;
};
exports.readSecrets = readSecrets;
