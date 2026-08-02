import test from "node:test";
import assert from "node:assert/strict";
import { events } from "../lib/demo-data";
import { rankEvent } from "../lib/ranking";
test("favorite artist meaningfully improves an event score", () => {
  const prefs = { artists: ["Nova Arcade"], genres: ["indie"], maxDistance: 20 };
  assert.ok(rankEvent(events[0], prefs) > rankEvent(events[2], prefs));
});
