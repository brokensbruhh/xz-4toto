import { clearUserCookie } from "@/lib/auth";

export async function POST() {
  return clearUserCookie();
}
