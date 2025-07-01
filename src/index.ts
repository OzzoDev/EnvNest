#!/usr/bin/env node

import { Command } from "commander";
import { clearUserConfig, loadUserConfig } from "./config/config";
import { authenticateWithGithub } from "./auth/github-auth";
import { getDbClient } from "./db";
import { selectProject, sortProjectsByCwd } from "./projectSelector";

const program = new Command();

program
  .name("envsync")
  .description("Sync secrets from your projects into .env files")
  .version("1.0.0")
  .action(async () => {
    // await clearUserConfig();
    let config = await loadUserConfig();

    if (!config) {
      console.log("🔐 No saved GitHub credentials. Logging in...");
      config = await authenticateWithGithub();
      console.log(
        `✅ Successfully logged in as GitHub user ID: ${config.userId}`
      );
    } else {
      console.log(`✅ Already logged in as GitHub user ID: ${config.userId}`);
    }

    const db = await getDbClient();

    const projects = await db.projects.find(config.userId);

    const sortedProjects = sortProjectsByCwd(projects);

    const selectedProject = await selectProject(sortedProjects);

    if (!selectedProject) {
      console.log("No project selected, exiting...");
      process.exit(1);
    }

    console.log(`✅ You selected project: ${selectedProject.name}`);
  });

program.parse();
