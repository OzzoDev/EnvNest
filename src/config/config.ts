import fs from "fs-extra";
import path from "path";
import envPaths from "env-paths";
import { Config } from "../types/types";

const paths = envPaths("envsyncs", { suffix: "" });
const configFile = path.join(paths.config, "config.json");

export const saveConfig = async (data: Partial<Config>) => {
  const currentConfig = await loadConfig();

  const mergedConfig: Config = {
    ...currentConfig,
    ...data,
  } as Config;

  await fs.ensureFile(configFile);
  await fs.writeJSON(configFile, mergedConfig);
};

export const loadConfig = async (): Promise<Config | null> => {
  if (await fs.pathExists(configFile)) {
    return fs.readJSON(configFile);
  }
  return null;
};

export const clearConfig = async () => {
  try {
    if (await fs.pathExists(configFile)) {
      await fs.remove(configFile);
    }
  } catch {}
};
