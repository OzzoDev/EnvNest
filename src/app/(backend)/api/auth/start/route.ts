import { NextResponse } from "next/server";
import crypto from "crypto";
import { OAuthApp } from "@octokit/oauth-app";

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

  const { url } = appOAuth.getWebFlowAuthorizationUrl({
    scopes: ["read:user"],
    redirectUrl: REDIRECT_URI,
    state,
  });

  const response = NextResponse.json({ url, state });

  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return response;
}
