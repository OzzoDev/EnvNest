"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectProject = exports.sortProjectsByCwd = void 0;
const path_1 = __importDefault(require("path"));
const inquirer_1 = __importDefault(require("inquirer"));
const fast_levenshtein_1 = __importDefault(require("fast-levenshtein"));
const similaritySocre = (projectName, cwdName) => {
    projectName = projectName.toLowerCase();
    cwdName = cwdName.toLowerCase();
    if (projectName.includes(cwdName))
        return 0;
    return fast_levenshtein_1.default.get(projectName, cwdName);
};
const sortProjectsByCwd = (projects) => {
    const cwdName = path_1.default.basename(process.cwd());
    return projects.sort((a, b) => similaritySocre(a.name, cwdName) - similaritySocre(b.name, cwdName));
};
exports.sortProjectsByCwd = sortProjectsByCwd;
const selectProject = async (projects) => {
    if (projects.length === 0) {
        console.log("No projects found.");
        return null;
    }
    const choices = projects.map((p) => ({
        name: p.name,
        value: p,
    }));
    const answers = await inquirer_1.default.prompt([
        {
            type: "list",
            name: "project",
            message: "Select a project",
            choices,
            pageSize: 10,
        },
    ]);
    return answers.project;
};
exports.selectProject = selectProject;
