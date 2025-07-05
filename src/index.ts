#!/usr/bin/env node

import { Command } from "commander";
import { clearConfig, loadConfig, saveConfig } from "./config/config";
import { getDbClient } from "./db";
import { selectProject, sortProjectsByCwd } from "./projectSelector";
import { getSecrets, syncSecrets } from "./utils/secrets";
import { loadSecrets } from "./secretLoader";
import { Config, Secret } from "./types/types";
import { selectSecret } from "./secretSelector";
import { readSecrets } from "./secretReader";
import { authenticate } from "./auth/auth";

const program = new Command();

program
  .name("envsync")
  .description("Sync secrets from your projects into .env files")
  .version("1.0.0")
  .action(async () => {
    let config = await loadConfig();

    if (!config) {
      const credentials = await authenticate();
      if (credentials) {
        config = {
          userId: credentials.userId,
          token: credentials.token,
        } as Config;
        console.log(
          `✅ Successfully logged in as GitHub user ID: ${config.userId}`
        );
      }
    }

    const db = await getDbClient();

    const projects = await db.projects.find(config?.userId as string);

    const sortedProjects = sortProjectsByCwd(projects);

    const selectedProject = await selectProject(sortedProjects);

    if (!selectedProject) {
      console.log("No project selected, exiting...");
      process.exit(1);
    }

    await saveConfig({ projectId: selectedProject.id });

    const secrets = await getSecrets(
      selectedProject.id,
      config?.userId as string
    );

    if (secrets.length === 0) {
      console.log("No .env files available in this project");
      process.exit(1);
    }

    await loadSecrets(secrets);

    process.exit(1);
  });

program
  .command("up")
  .description("Sync environment variables with remote server")
  .action(async () => {
    const config = await loadConfig();

    let projectId = config?.projectId;

    const db = await getDbClient();

    if (!projectId && config) {
      const projects = await db.projects.find(config?.userId as string);

      const sortedProjects = sortProjectsByCwd(projects);

      const selectedProject = await selectProject(sortedProjects);

      if (!selectedProject) {
        console.log("No project selected, exiting...");
        process.exit(1);
      }

      projectId = selectedProject.id;
    }

    const secrets = await getSecrets(
      projectId as number,
      config?.userId as string
    );

    if (secrets.length === 0) {
      console.log("No .env files available in this project");
      process.exit(1);
    }

    const selectedSecret = await selectSecret([
      { name: "all", id: -1 },
      ...secrets.map((secret) => ({
        id: secret.id,
        name: `${secret.environment}:${secret.path}`,
      })),
    ]);

    if (secrets.length === 0) {
      console.log("No .env file selected, exiting...");
      process.exit(1);
    }

    const secretsToSync =
      selectedSecret?.id === -1
        ? [...secrets]
        : ([
            secrets.find((secret) => secret.id === selectedSecret?.id),
          ] as Secret[]);

    const localSecrets = await readSecrets(secretsToSync);

    await syncSecrets(
      projectId as number,
      config?.userId as string,
      localSecrets
    );

    console.log("File(s) synced successfully");
    process.exit(1);
  });

program
  .command("logout")
  .description("Logout from EnvNest")
  .action(async () => {
    if (!(await loadConfig())) {
      console.log("Your are not logged in");
      process.exit(-1);
    }

    await clearConfig();

    console.log("Logged out successfully");
    process.exit(1);
  });

program.parse();
