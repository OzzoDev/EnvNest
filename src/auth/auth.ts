import axios, { AxiosError } from "axios";
import open from "open";
import readline from "readline";
import { START_URL, TOKEN_URL } from "../config";
import { User } from "../types/types";
import { saveConfig } from "../config/config";

const POLL_INTERVAL = 500;

const prompt = (query: string) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise<string>((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
};

export const authenticate = async (): Promise<User | null> => {
  try {
    await open(START_URL);
    console.log(`\nPlease complete login in your browser.`);

    const accessKey = await prompt("Paste the access key here: ");

    let authenticated = false;
    let user: User | null = null;
    const maxAttempts = 60;
    let attempts = 0;

    while (!authenticated && attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL));
      attempts++;

      try {
        const response = await axios.get(
          `${TOKEN_URL}?key=${encodeURIComponent(accessKey)}`
        );
        const session = response.data.session;

        if (session) {
          authenticated = true;
          user = { token: session.accessToken, userId: session.user.id };

          await saveConfig({ userId: user.userId, token: user.token });
          break;
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (attempts % 10 === 0) {
            console.error(
              `Polling error (attempt ${attempts}): ${err.message}`
            );
          }
        }
      }
    }

    if (!authenticated) {
      console.log("Authentication timed out.");
      return null;
    }

    return user;
  } catch (err) {
    if (err instanceof AxiosError) {
      console.error("Authentication failed:", err.message);
    }
    return null;
  }
};
