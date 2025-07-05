import path from "path";
import fs from "fs";
import { Secret } from "./types/types";

export const readSecrets = async (secrets: Secret[]): Promise<Secret[]> => {
  const cwd = process.cwd();
  const results: Secret[] = [];

  for (const secret of secrets) {
    const relativePath = secret.path.replace(/^[/\\]+/, "");
    const absolutePath = path.resolve(cwd, relativePath);
    const fileName = secret.environment === "production" ? ".prod.env" : ".env";
    const fullFilePath = path.join(absolutePath, fileName);

    try {
      const stats = await fs.promises.stat(fullFilePath);
      if (!stats.isFile()) {
        console.log(
          `❌ Not a file: ${path.relative(cwd, fullFilePath)}. Skipping.`
        );
        continue;
      }
    } catch {
      console.log(
        `❌ File not found: ${path.relative(cwd, fullFilePath)}. Skipping.`
      );
      continue;
    }

    try {
      const content = await fs.promises.readFile(fullFilePath, "utf-8");
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
    } catch {
      console.log(
        `❌ Failed to read env file at: ${path.relative(cwd, fullFilePath)}`
      );
    }
  }

  return results;
};
