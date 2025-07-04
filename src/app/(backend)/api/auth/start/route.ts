import { NextResponse } from "next/server";
import crypto from "crypto";
import { OAuthApp } from "@octokit/oauth-app";
import { sessions } from "../sessionStore";

const CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const REDIRECT_URI = "https://envnest.com/api/auth/callback/github";

const appOAuth = new OAuthApp({
  clientType: "oauth-app",
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
});

export async function GET() {
  const state = crypto.randomBytes(16).toString("hex");

  sessions.set(state, { state });

  const { url } = appOAuth.getWebFlowAuthorizationUrl({
    scopes: ["read:user"],
    redirectUrl: REDIRECT_URI,
    state,
  });

  return NextResponse.json({ url, state });
}
