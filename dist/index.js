#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const program = new commander_1.Command();
program
    .name("envsync")
    .description("Sync secrets from your projects into .env files")
    .version("1.0.0")
    .action(() => console.log("CLI is working!"));
program.parse();
