import { setCache } from "../../../../../../lib/redis";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  const accessKey = uuidv4();

  const session = await getServerSession(authOptions);

  if (!session) {
    NextResponse.redirect(`/auth/failed`);
  }

  await setCache(`cli-auth:${accessKey}`, session, 600);

  return NextResponse.redirect(`/auth/success?key=${accessKey}`);
}
