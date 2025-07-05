import { NextRequest, NextResponse } from "next/server";
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
  const { cookies } = req;
  const code = cookies.get("oauth_code")?.value;

  if (!code) {
    return NextResponse.json({ error: "Code not found" }, { status: 400 });
  }

  try {
    const { authentication } = await appOAuth.createToken({
      code,
      redirectUrl: REDIRECT_URI,
    });

    const response = NextResponse.json({ token: authentication.token });
    response.cookies.delete("oauth_code");

    return response;
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to exchange token", details: err },
      { status: 500 }
    );
  }
}
