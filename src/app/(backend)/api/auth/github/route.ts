import { OAuthApp } from "@octokit/oauth-app";
import { sessions } from "../sessionStore";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const generateRandomState = (length = 16): string => {
  return crypto.randomBytes(length).toString("hex");
};

const CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const REDIRECT_URI = "https://envnest.com/api/auth/callback/github";

export async function GET() {
  const state = generateRandomState();
  sessions.set(state, { state });

  const app = new OAuthApp({
    clientType: "oauth-app",
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
  });

  const { url } = app.getWebFlowAuthorizationUrl({
    scopes: ["read:user"],
    state,
    redirectUrl: REDIRECT_URI,
  });

  return new Response(JSON.stringify({ url, state }), {
    headers: { "Content-Type": "application/json" },
  });
}
