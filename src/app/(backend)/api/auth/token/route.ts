import { NextRequest, NextResponse } from "next/server";
import { sessions } from "../sessionStore";
import { OAuthApp } from "@octokit/oauth-app";

const CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const REDIRECT_URI = "https://envnest.com/api/auth/callback/github";

const appOAuth = new OAuthApp({
  clientType: "oauth-app",
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state");

  if (!state || !sessions.has(state)) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  const session = sessions.get(state)!;

  if (!session.code) {
    return NextResponse.json(
      { error: "Code not yet received" },
      { status: 400 }
    );
  }

  const { authentication } = await appOAuth.createToken({
    code: session.code,
    redirectUrl: REDIRECT_URI,
  });

  sessions.delete(state);

  return NextResponse.json({ token: authentication.token });
}
