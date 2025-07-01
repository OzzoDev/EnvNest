import path from "path";
import inquirer from "inquirer";
import levenshtein from "fast-levenshtein";
import { Project } from "./types/types";

const similaritySocre = (projectName: string, cwdName: string) => {
  projectName = projectName.toLowerCase();
  cwdName = cwdName.toLowerCase();

  if (projectName.includes(cwdName)) return 0;

  return levenshtein.get(projectName, cwdName);
};

export const sortProjectsByCwd = (projects: Project[]) => {
  const cwdName = path.basename(process.cwd());

  return projects.sort(
    (a, b) =>
      similaritySocre(a.name, cwdName) - similaritySocre(b.name, cwdName)
  );
};

export const selectProject = async (projects: Project[]) => {
  if (projects.length === 0) {
    console.log("No projects found.");
    return null;
  }

  const choices = projects.map((p) => ({
    name: p.name,
    value: p,
  }));

  const answers = await inquirer.prompt([
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
