import { setCache } from "../../../../../../lib/redis";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../../../lib/authOptions";

export async function GET() {
  const accessKey = uuidv4();

  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.redirect(
      new URL(`/auth/failed`, process.env.NEXT_PUBLIC_SERVER_URL)
    );
  }

  await setCache(`cli-auth:${accessKey}`, session, 600);

  return NextResponse.redirect(
    new URL(
      `/auth/success?key=${accessKey}`,
      process.env.NEXT_PUBLIC_SERVER_URL
    )
  );
}
