"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearConfig = exports.loadConfig = exports.saveConfig = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const env_paths_1 = __importDefault(require("env-paths"));
const paths = (0, env_paths_1.default)("envsyncs", { suffix: "" });
const configFile = path_1.default.join(paths.config, "config.json");
const saveConfig = async (data) => {
    const currentConfig = await (0, exports.loadConfig)();
    const mergedConfig = {
        ...currentConfig,
        ...data,
    };
    await fs_extra_1.default.ensureFile(configFile);
    await fs_extra_1.default.writeJSON(configFile, mergedConfig);
};
exports.saveConfig = saveConfig;
const loadConfig = async () => {
    if (await fs_extra_1.default.pathExists(configFile)) {
        return fs_extra_1.default.readJSON(configFile);
    }
    return null;
};
exports.loadConfig = loadConfig;
const clearConfig = async () => {
    try {
        if (await fs_extra_1.default.pathExists(configFile)) {
            await fs_extra_1.default.remove(configFile);
        }
    }
    catch { }
};
exports.clearConfig = clearConfig;
