import { NextResponse } from "next/server";
import { registrationSchema } from "@/lib/auth-validation";
import { authCookie, register } from "@/server/auth-store";

export async function POST(request: Request) {
  const input = registrationSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Use a valid email, a display name, and a password of at least 8 characters." }, { status: 400 });
  const result = await register(input.data.email, input.data.password, input.data.displayName);
  if ("error" in result) return NextResponse.json({ error: "An account already exists for that email.", code: result.error }, { status: 409 });
  const response = NextResponse.json({ user: { email: result.user.email, displayName: result.user.displayName } }, { status: 201 });
  response.cookies.set(authCookie.name, result.token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: authCookie.maxAge });
  return response;
}
