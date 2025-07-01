#!/usr/bin/env node

import { Command } from "commander";
import { loadUserConfig } from "./config/config";
import { authenticateWithGithub } from "./auth/github-auth";
import { getDbClient } from "./db";
import { selectProject, sortProjectsByCwd } from "./projectSelector";
import { getSecrets } from "./utils/secrets";
import { loadSecrets } from "./secretLoader";

const program = new Command();

program
  .name("envsync")
  .description("Sync secrets from your projects into .env files")
  .version("1.0.0")
  .action(async () => {
    let config = await loadUserConfig();

    if (!config) {
      console.log("🔐 No saved GitHub credentials. Logging in...");
      config = await authenticateWithGithub();
      console.log(
        `✅ Successfully logged in as GitHub user ID: ${config.userId}`
      );
    }

    const db = await getDbClient();

    const projects = await db.projects.find(config.userId);

    const sortedProjects = sortProjectsByCwd(projects);

    const selectedProject = await selectProject(sortedProjects);

    if (!selectedProject) {
      console.log("No project selected, exiting...");
      process.exit(1);
    }

    const secrets = await getSecrets(selectedProject.id, config.userId);

    if (secrets.length === 0) {
      console.log("No .env files available in this project");
      process.exit(1);
    }

    await loadSecrets(secrets);

    process.exit(1);
  });

program.parse();
