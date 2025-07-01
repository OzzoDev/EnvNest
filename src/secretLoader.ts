import path from "path";
import fs from "fs";
import { Secret } from "./types/types";

export const loadSecrets = async (secrets: Secret[]) => {
  const cwd = process.cwd();

  for (const secret of secrets) {
    const absolutePath = path.resolve(cwd, secret.path);

    try {
      const stats = await fs.promises.stat(absolutePath);

      if (!stats.isDirectory()) {
        const relativePath = path.relative(cwd, absolutePath);
        console.log(`❌ Path is not a directory: ${relativePath}. Skipping.`);
        continue;
      }
    } catch {
      const relativePath = path.relative(cwd, absolutePath);
      console.log(`❌ Path does not exist: ${relativePath}. Skipping.`);
      continue;
    }

    const fileName = secret.environment === "production" ? ".prod.env" : ".env";
    const fullFilePath = path.join(absolutePath, fileName);

    try {
      const formattedContent = secret.content
        .split("&&")
        .map((line) => line.trim())
        .filter(Boolean)
        .join("\n");

      await fs.promises.writeFile(fullFilePath, formattedContent, "utf-8");

      const relativePath = path.relative(cwd, absolutePath).trim() || "./";

      console.log(`✅ Successfully installed env file at: ${relativePath}`);
    } catch (err) {
      const relativePath = path.relative(cwd, absolutePath).trim() || "./";
      console.log(`❌ Failed to write env file at: ${relativePath}`, err);
    }
  }
};
