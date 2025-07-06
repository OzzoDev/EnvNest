import { getCache, delCache } from "../../../../../../lib/redis";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  if (!key) {
    return new Response(JSON.stringify({ error: "Missing key parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const session = await getCache(`cli-auth:${key}`);

  if (!session) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  await delCache(`cli-auth:${key}`);

  return new Response(JSON.stringify({ authenticated: true, session }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
