#!/usr/bin/env node

import { Command } from "commander";

const program = new Command();

program
  .name("envsync")
  .description("Sync secrets from your projects into .env files")
  .version("1.0.0")
  .action(() => console.log("CLI is working!"));

program.parse();
