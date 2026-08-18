import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { progressSchema } from "@/lib/progress-validation";
import { authCookie, getProgress, saveProgress } from "@/server/auth-store";

async function token() { return (await cookies()).get(authCookie.name)?.value; }

export async function GET() {
  const sessionToken = await token();
  if (!sessionToken) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  return NextResponse.json({ progress: await getProgress(sessionToken) });
}

export async function PUT(request: Request) {
  const input = progressSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Invalid progress data." }, { status: 400 });
  if (!await saveProgress(await token(), input.data)) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  return NextResponse.json({ saved: true });
}
