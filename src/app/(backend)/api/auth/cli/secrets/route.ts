import { NextRequest, NextResponse } from "next/server";
import { getDbClient } from "../../../../../../lib/db/models";
import dotenv from "dotenv";
import { aesDecrypt, aesEncrypt } from "@/lib/aes-helpers";

dotenv.config();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const accessToken = url.searchParams.get("accessToken");
    const projectId = url.searchParams.get("projectId");

    if (!userId || !accessToken || !projectId) {
      return NextResponse.json(
        { error: "Missing userId or accessToken or projectId" },
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

    const projectKey = (
      await db.project.getKey(parseInt(projectId), parseInt(userId))
    )?.encrypted_key;

    if (!projectKey) {
      return NextResponse.json({ error: "Project key not found", status: 400 });
    }

    const decryptedKey = aesDecrypt(
      projectKey,
      process.env.ENCRYPTION_ROOT_KEY!
    );

    const secrets = await db.secret.getByProject(parseInt(projectId));

    const decryptedSecrets = secrets.map((secret) => ({
      ...secret,
      content: aesDecrypt(secret.content, decryptedKey),
    }));

    return NextResponse.json({ secrets: decryptedSecrets });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const accessToken = url.searchParams.get("accessToken");
    const projectId = url.searchParams.get("projectId");

    const { secrets } = await request.json();

    if (!userId || !accessToken || !projectId) {
      return NextResponse.json(
        { error: "Missing userId, accessToken, or projectId" },
        { status: 400 }
      );
    }

    if (!Array.isArray(secrets)) {
      return NextResponse.json(
        { error: "Invalid or missing secrets in request body" },
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

    const projectKey = (
      await db.project.getKey(parseInt(projectId), parseInt(userId))
    )?.encrypted_key;

    if (!projectKey) {
      return NextResponse.json(
        { error: "Project key not found" },
        { status: 400 }
      );
    }

    const decryptedKey = aesDecrypt(
      projectKey,
      process.env.ENCRYPTION_ROOT_KEY!
    );

    await Promise.all(
      secrets.map(async (secret: { id: number; content: string }) => {
        const updatedSecret = await db.secret.update(
          secret.id,
          aesEncrypt(secret.content, decryptedKey)
        );
        await db.auditLog.create(
          userId,
          secret.id,
          updatedSecret?.secret_version_id as number,
          "Synced with CLI",
          { type: "CLI" }
        );
      })
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
