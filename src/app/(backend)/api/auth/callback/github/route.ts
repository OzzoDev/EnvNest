import { NextRequest, NextResponse } from "next/server";
import { sessions } from "../../sessionStore";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state || !sessions.has(state)) {
    return NextResponse.json(
      { error: "Invalid code or state" },
      { status: 400 }
    );
  }

  const session = sessions.get(state)!;
  session.code = code;

  return new NextResponse(
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
      headers: {
        "Content-Type": "text/html",
        "X-Auth-Code": code,
      },
    }
  );
}
