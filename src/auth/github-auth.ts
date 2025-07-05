import axios from "axios";
import dotenv from "dotenv";
import { saveConfig } from "../config/config";
import { User } from "../types/types";

dotenv.config();

const CLIENT_ID = process.env.GITHUB_CLIENT_ID!;

if (!CLIENT_ID) throw new Error("Missing GITHUB_CLIENT_ID in .env");

export const authenticateWithGithub = async (): Promise<User | null> => {
  try {
    const { data } = await axios.post(
      "https://github.com/login/device/code",
      new URLSearchParams({
        client_id: CLIENT_ID,
        scope: "read:user",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
      }
    );

    console.log(`\n🔗 Visit: ${data.verification_uri}`);
    console.log(`📝 Enter code: ${data.user_code}\n`);

    const pollInterval = data.interval * 1000;
    const expiresIn = data.expires_in;
    const maxAttempts = Math.ceil(expiresIn / data.interval);
    let attempts = 0;
    let token: string | null = null;

    while (!token && attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, pollInterval));
      attempts++;

      try {
        const res = await axios.post(
          "https://github.com/login/oauth/access_token",
          new URLSearchParams({
            client_id: CLIENT_ID,
            device_code: data.device_code,
            grant_type: "urn:ietf:params:oauth:grant-type:device_code",
          }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Accept: "application/json",
            },
          }
        );

        if (res.data.access_token) {
          token = res.data.access_token;
        } else if (
          res.data.error &&
          res.data.error !== "authorization_pending"
        ) {
          throw new Error(`GitHub error: ${res.data.error_description}`);
        }
      } catch {}
    }

    if (!token) {
      throw new Error("Authentication timed out or failed.");
    }

    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `token ${token}` },
    });

    const userId = String(userRes.data.id);

    await saveConfig({ userId, token });

    return { userId, token };
  } catch {
    return null;
  }
};
