"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearUserConfig = exports.loadUserConfig = exports.saveUserConfig = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const env_paths_1 = __importDefault(require("env-paths"));
const paths = (0, env_paths_1.default)("envsyncs", { suffix: "" });
const configFile = path_1.default.join(paths.config, "config.json");
const saveUserConfig = async (data) => {
    await fs_extra_1.default.ensureFile(configFile);
    await fs_extra_1.default.writeJSON(configFile, data);
};
exports.saveUserConfig = saveUserConfig;
const loadUserConfig = async () => {
    if (await fs_extra_1.default.pathExists(configFile)) {
        return fs_extra_1.default.readJSON(configFile);
    }
    return null;
};
exports.loadUserConfig = loadUserConfig;
const clearUserConfig = async () => {
    try {
        if (await fs_extra_1.default.pathExists(configFile)) {
            await fs_extra_1.default.remove(configFile);
            console.log("🗑️ Config file deleted for testing.");
        }
        else {
            console.log("⚠️ No config file to delete.");
        }
    }
    catch (error) {
        console.error("❌ Failed to delete config file:", error);
    }
};
exports.clearUserConfig = clearUserConfig;
