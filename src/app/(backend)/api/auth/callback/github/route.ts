import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const storedState = req.cookies.get("oauth_state")?.value;

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.json(
      { error: "Invalid code or state" },
      { status: 400 }
    );
  }

  const response = new NextResponse(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>Authentication Successful</title>
        <style>
          body {
            background-color: #000;
            color: #FFA500;
            font-family: Arial, sans-serif;
            padding: 40px;
            text-align: center;
          }
          h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
          }
          p {
            font-size: 1.2rem;
          }
        </style>
      </head>
      <body>
        <h1>Authentication successful!</h1>
        <p>You can close this tab now.</p>
      </body>
    </html>`,
    {
      status: 200,
      headers: { "Content-Type": "text/html" },
    }
  );

  response.cookies.delete("oauth_state");

  response.cookies.set("oauth_code", code, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return response;
}
