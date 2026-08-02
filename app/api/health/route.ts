import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ ok: true, mode: process.env.JAMBASE_API_KEY ? "configured" : "demo", serverSecretsAvailable: true, timestamp: new Date().toISOString() });
}
