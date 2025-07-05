"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectSecret = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const selectSecret = async (secrets) => {
    if (secrets.length === 0) {
        console.log("No secrets found.");
        return null;
    }
    const choices = secrets.map((p) => ({
        name: p.name,
        value: p,
    }));
    try {
        const answers = await inquirer_1.default.prompt([
            {
                type: "list",
                name: "secret",
                message: "Select a or all .env file to sync with the remote sever",
                choices,
                pageSize: 10,
            },
        ]);
        return answers.secret;
    }
    catch {
        process.exit(0);
    }
};
exports.selectSecret = selectSecret;
