import { NextRequest, NextResponse } from "next/server";
import { getCache, setCache } from "../../../../../../lib/redis";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.json(
      { error: "Missing code or state" },
      { status: 400 }
    );
  }

  const stored = await getCache<{ state: string }>(`oauth_state:${state}`);

  if (!stored || stored.state !== state) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  await setCache(`oauth_code:${state}`, { code }, 600);

  return new NextResponse(
    `<!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Successful</title>
        <style>
          body { background-color: #000; color: #FFA500; font-family: Arial, sans-serif; padding: 40px; text-align: center; }
          h1 { font-size: 2.5rem; margin-bottom: 1rem; }
          p { font-size: 1.2rem; }
        </style>
      </head>
      <body>
        <h1>Authentication successful!</h1>
        <p>You can close this tab now.</p>
      </body>
      </html>`,
    { status: 200, headers: { "Content-Type": "text/html" } }
  );
}
