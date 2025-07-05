import { NextRequest, NextResponse } from "next/server";
import { getCache } from "../../../../../lib/redis";
import { OAuthApp } from "@octokit/oauth-app";
import { delCache } from "@/lib/redis";

const CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const REDIRECT_URI = "https://envnest.com/api/auth/callback/github";

const appOAuth = new OAuthApp({
  clientType: "oauth-app",
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
});

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const state = url.searchParams.get("state");

  if (!state) {
    return NextResponse.json({ error: "Missing state" }, { status: 400 });
  }

  const storedCode = await getCache<{ code: string }>(`oauth_code:${state}`);

  if (!storedCode || !storedCode.code) {
    return NextResponse.json(
      { error: "Code not yet received" },
      { status: 400 }
    );
  }

  try {
    const { authentication } = await appOAuth.createToken({
      code: storedCode.code,
      redirectUrl: REDIRECT_URI,
    });

    await delCache(`oauth_state:${state}`);

    return NextResponse.json({
      token: authentication.token,
      code: storedCode.code,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create token" },
      { status: 500 }
    );
  }
}
