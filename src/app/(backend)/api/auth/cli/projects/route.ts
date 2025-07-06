import { NextRequest, NextResponse } from "next/server";
import { getDbClient } from "../../../../../../lib/db/models";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const accessToken = url.searchParams.get("accessToken");

    if (!userId || !accessToken) {
      return NextResponse.json(
        { error: "Missing userId or accessToken" },
        { status: 400 }
      );
    }

    const db = await getDbClient();

    const token = await db.profile.getAccessToken(userId);

    if (!token) {
      return NextResponse.json(
        { error: "Access token not found for user" },
        { status: 401 }
      );
    }

    if (accessToken !== token) {
      return NextResponse.json(
        { error: "Invalid access token" },
        { status: 401 }
      );
    }

    const projects = await db.project.getByProfile(parseInt(userId));

    return NextResponse.json({ projects });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
