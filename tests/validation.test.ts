import test from "node:test";
import assert from "node:assert/strict";
import { progressSchema } from "../lib/progress-validation";
import { reviewSchema } from "../lib/validation";

const validProgress = {
  completedQuestIds: [],
  coins: 0,
  chapterBonusAwarded: false,
  displayName: "Festival friend",
  avatarIcon: "✦",
  outfit: { body: "Androgynous", skinTone: "Medium", hair: "Curls", hat: "None", top: "Sun tee", bottom: "Utility shorts", accessory: "Pins", background: "Forest" },
};

test("review schema rejects out of range confidence", () => {
  assert.throws(() => reviewSchema.parse({ relevantToQuest: true, confidence: 2, reasonCodes: [], shortExplanation: "x", requiresHumanReview: true, safetyFlags: [] }));
});

test("progress schema keeps saved event status and upgrades older records", () => {
  assert.deepEqual(progressSchema.parse(validProgress).rsvps, {});
  assert.deepEqual(progressSchema.parse({ ...validProgress, rsvps: { event_1: "going" } }).rsvps, { event_1: "going" });
});

test("progress schema rejects unknown saved event states", () => {
  assert.throws(() => progressSchema.parse({ ...validProgress, rsvps: { event_1: "maybe" } }));
});
