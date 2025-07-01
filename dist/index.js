#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const config_1 = require("./config/config");
const github_auth_1 = require("./auth/github-auth");
const db_1 = require("./db");
const projectSelector_1 = require("./projectSelector");
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
    const db = await (0, db_1.getDbClient)();
    const projects = await db.projects.find(config.userId);
    const sortedProjects = (0, projectSelector_1.sortProjectsByCwd)(projects);
    const selectedProject = await (0, projectSelector_1.selectProject)(sortedProjects);
    if (!selectedProject) {
        console.log("No project selected, exiting...");
        process.exit(1);
    }
    console.log(`✅ You selected project: ${selectedProject.name}`);
});
program.parse();
