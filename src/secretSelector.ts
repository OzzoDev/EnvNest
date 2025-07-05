import inquirer from "inquirer";
import { Secret } from "./types/types";

export const selectSecret = async (
  secrets: { name: string; id: Secret["id"] }[]
) => {
  if (secrets.length === 0) {
    console.log("No secrets found.");
    return null;
  }

  const choices = secrets.map((p) => ({
    name: p.name,
    value: p,
  }));

  try {
    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "secret",
        message: "Select a or all .env file to sync with the remote sever",
        choices,
        pageSize: 10,
      },
    ]);

    return answers.secret as { name: string; id: Secret["id"] };
  } catch {
    process.exit(0);
  }
};
