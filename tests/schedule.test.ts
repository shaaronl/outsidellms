import test from "node:test";
import assert from "node:assert/strict";
import { detectScheduleConflicts } from "../lib/schedule";

const minute = 60_000;

test("schedule marks a verified interval overlap as definite", () => {
  const conflicts = detectScheduleConflicts([
    { id: "a", name: "First set", startAt: 0, endAt: 60 * minute },
    { id: "b", name: "Second set", startAt: 45 * minute, endAt: 90 * minute },
  ]);
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].kind, "definite");
  assert.equal(conflicts[0].overlapMinutes, 15);
});

test("schedule labels a nearby set with unknown end time as possible", () => {
  const conflicts = detectScheduleConflicts([
    { id: "a", name: "Unknown-length set", startAt: 0 },
    { id: "b", name: "Later set", startAt: 60 * minute, endAt: 100 * minute },
  ]);
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].kind, "possible");
  assert.equal(conflicts[0].overlapMinutes, undefined);
});

test("schedule does not invent conflicts between adjacent sets", () => {
  const conflicts = detectScheduleConflicts([
    { id: "a", name: "First set", startAt: 0, endAt: 60 * minute },
    { id: "b", name: "Second set", startAt: 60 * minute, endAt: 120 * minute },
  ]);
  assert.deepEqual(conflicts, []);
});
