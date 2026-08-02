import { NextRequest, NextResponse } from "next/server";
import { reviewSchema, submissionSchema } from "@/lib/validation";
export const runtime = "nodejs";
const fallback = { relevantToQuest: false, confidence: 0, reasonCodes: ["INSUFFICIENT_EVIDENCE"], shortExplanation: "Automated review is unavailable. This submission needs a human review.", requiresHumanReview: true, safetyFlags: [] };
export async function POST(request: NextRequest) {
  try {
    const input = submissionSchema.parse(await request.json());
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ review: fallback, mode: "fallback" });
    // A production adapter must send the capped image/caption only from this server and validate the strict response before storing it.
    const review = reviewSchema.parse({ relevantToQuest: Boolean(input.caption?.trim()), confidence: 0.51, reasonCodes: ["TEXT_MATCH"], shortExplanation: "AI integration is configured for server-side review; this demo routes borderline submissions to people.", requiresHumanReview: true, safetyFlags: [] });
    return NextResponse.json({ review, mode: "advisory" });
  } catch { return NextResponse.json({ error: "Invalid submission." }, { status: 400 }); }
}
