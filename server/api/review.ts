import { reviewSchema, submissionSchema } from "@/lib/validation";
export async function reviewSubmission(input: unknown) {
  submissionSchema.parse(input);
  // On a server-capable deployment, invoke Responses API with a strict schema and capped image input here.
  return reviewSchema.parse({ relevantToQuest: false, confidence: 0, reasonCodes: ["INSUFFICIENT_EVIDENCE"], shortExplanation: "Human review required.", requiresHumanReview: true, safetyFlags: [] });
}
