#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const config_1 = require("./config/config");
const github_auth_1 = require("./auth/github-auth");
const db_1 = require("./db");
const projectSelector_1 = require("./projectSelector");
const secrets_1 = require("./utils/secrets");
const secretLoader_1 = require("./secretLoader");
const secretSelector_1 = require("./secretSelector");
const secretReader_1 = require("./secretReader");
const program = new commander_1.Command();
program
    .name("envsync")
    .description("Sync secrets from your projects into .env files")
    .version("1.0.0")
    .action(async () => {
    let config = await (0, config_1.loadConfig)();
    if (!config) {
        const credentials = await (0, github_auth_1.authenticateWithGithub)();
        if (credentials) {
            config = {
                userId: credentials.userId,
                token: credentials.token,
            };
            console.log(`✅ Successfully logged in as GitHub user ID: ${config.userId}`);
        }
    }
    const db = await (0, db_1.getDbClient)();
    const projects = await db.projects.find(config?.userId);
    const sortedProjects = (0, projectSelector_1.sortProjectsByCwd)(projects);
    const selectedProject = await (0, projectSelector_1.selectProject)(sortedProjects);
    if (!selectedProject) {
        console.log("No project selected, exiting...");
        process.exit(1);
    }
    await (0, config_1.saveConfig)({ projectId: selectedProject.id });
    const secrets = await (0, secrets_1.getSecrets)(selectedProject.id, config?.userId);
    if (secrets.length === 0) {
        console.log("No .env files available in this project");
        process.exit(1);
    }
    await (0, secretLoader_1.loadSecrets)(secrets);
    process.exit(1);
});
program
    .command("up")
    .description("Sync environment variables with remote server")
    .action(async () => {
    const config = await (0, config_1.loadConfig)();
    let projectId = config?.projectId;
    const db = await (0, db_1.getDbClient)();
    if (!projectId && config) {
        const projects = await db.projects.find(config?.userId);
        const sortedProjects = (0, projectSelector_1.sortProjectsByCwd)(projects);
        const selectedProject = await (0, projectSelector_1.selectProject)(sortedProjects);
        if (!selectedProject) {
            console.log("No project selected, exiting...");
            process.exit(1);
        }
        projectId = selectedProject.id;
    }
    const secrets = await (0, secrets_1.getSecrets)(projectId, config?.userId);
    if (secrets.length === 0) {
        console.log("No .env files available in this project");
        process.exit(1);
    }
    const selectedSecret = await (0, secretSelector_1.selectSecret)([
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
    const secretsToSync = selectedSecret?.id === -1
        ? [...secrets]
        : [
            secrets.find((secret) => secret.id === selectedSecret?.id),
        ];
    const localSecrets = await (0, secretReader_1.readSecrets)(secretsToSync);
    await (0, secrets_1.syncSecrets)(projectId, config?.userId, localSecrets);
    console.log("File(s) synced successfully");
    process.exit(1);
});
program
    .command("logout")
    .description("Logout from EnvNest")
    .action(async () => {
    if (!(await (0, config_1.loadConfig)())) {
        console.log("Your are not logged in");
        process.exit(-1);
    }
    await (0, config_1.clearConfig)();
    console.log("Logged out successfully");
    process.exit(1);
});
program.parse();
