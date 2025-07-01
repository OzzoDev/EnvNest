#!/usr/bin/env node

import { Command } from "commander";
import { clearUserConfig, loadUserConfig } from "./config/config";
import { authenticateWithGithub } from "./auth/github-auth";

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

    // Proceed with other CLI tasks here...
  });

program.parse();
