import fs from "fs-extra";
import path from "path";
import envPaths from "env-paths";
import { User } from "../types/types";

const paths = envPaths("envsyncs", { suffix: "" });
const configFile = path.join(paths.config, "config.json");

export const saveUserConfig = async (data: User) => {
  await fs.ensureFile(configFile);
  await fs.writeJSON(configFile, data);
};

export const loadUserConfig = async (): Promise<User | null> => {
  if (await fs.pathExists(configFile)) {
    return fs.readJSON(configFile);
  }
  return null;
};

export const clearUserConfig = async () => {
  try {
    if (await fs.pathExists(configFile)) {
      await fs.remove(configFile);
      console.log("🗑️ Config file deleted for testing.");
    } else {
      console.log("⚠️ No config file to delete.");
    }
  } catch (error) {
    console.error("❌ Failed to delete config file:", error);
  }
};
