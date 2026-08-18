import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authCookie, logout } from "@/server/auth-store";

export async function POST() {
  await logout((await cookies()).get(authCookie.name)?.value);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(authCookie.name, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
  return response;
}
