import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "demo_user";

export function getUserId(): string | null {
  const cookie = cookies().get(COOKIE_NAME);
  return cookie?.value ?? null;
}

export function requireUserId(): string {
  const userId = getUserId();
  if (!userId) throw new Error("UNAUTHORIZED");
  return userId;
}

export function setUserCookie(username: string) {
  return NextResponse.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": `${COOKIE_NAME}=${encodeURIComponent(
          username
        )}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`,
      },
    }
  );
}

export function clearUserCookie() {
  return NextResponse.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
      },
    }
  );
}
