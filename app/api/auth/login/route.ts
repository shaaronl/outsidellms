import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/auth-validation";
import { authCookie, login } from "@/server/auth-store";

export async function POST(request: Request) {
  const input = loginSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Enter a valid email and a password of at least 8 characters." }, { status: 400 });
  const result = await login(input.data.email, input.data.password);
  if ("error" in result) return NextResponse.json({ error: result.error === "ACCOUNT_NOT_FOUND" ? "No account exists for that email." : "That password does not match.", code: result.error }, { status: result.error === "ACCOUNT_NOT_FOUND" ? 404 : 401 });
  const response = NextResponse.json({ user: { email: result.user.email, displayName: result.user.displayName } });
  response.cookies.set(authCookie.name, result.token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: authCookie.maxAge });
  return response;
}
