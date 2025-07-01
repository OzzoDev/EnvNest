#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const config_1 = require("./config/config");
const github_auth_1 = require("./auth/github-auth");
const program = new commander_1.Command();
program
    .name("envsync")
    .description("Sync secrets from your projects into .env files")
    .version("1.0.0")
    .action(async () => {
    // await clearUserConfig();
    let config = await (0, config_1.loadUserConfig)();
    if (!config) {
        console.log("🔐 No saved GitHub credentials. Logging in...");
        config = await (0, github_auth_1.authenticateWithGithub)();
        console.log(`✅ Successfully logged in as GitHub user ID: ${config.userId}`);
    }
    else {
        console.log(`✅ Already logged in as GitHub user ID: ${config.userId}`);
    }
    // Proceed with other CLI tasks here...
});
program.parse();
