import { NextRequest } from "next/server";
import { setUserCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username } = await req.json().catch(() => ({}));
  const clean = typeof username === "string" ? username.trim() : "";

  if (!clean || clean.length < 3 || clean.length > 24) {
    return new Response(JSON.stringify({ error: "Username 3-24 chars" }), {
      status: 400,
    });
  }

  return setUserCookie(clean);
}
