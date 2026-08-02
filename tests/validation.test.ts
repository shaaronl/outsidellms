import test from "node:test";
import assert from "node:assert/strict";
import { reviewSchema } from "../lib/validation";
test("review schema rejects out of range confidence", () => {
  assert.throws(() => reviewSchema.parse({ relevantToQuest: true, confidence: 2, reasonCodes: [], shortExplanation: "x", requiresHumanReview: true, safetyFlags: [] }));
});
