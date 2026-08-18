import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authCookie, session } from "@/server/auth-store";

export async function GET() {
  const user = await session((await cookies()).get(authCookie.name)?.value);
  return NextResponse.json({ user: user ? { email: user.email, displayName: user.displayName } : null }, { status: user ? 200 : 401 });
}
