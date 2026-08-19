import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const serverTime = Date.now();
    if (!userId) return { phase: "guest" as const, now: null, next: null, savedCount: 0, serverTime };
    const rows = await ctx.db.query("rsvps").withIndex("by_user", (index) => index.eq("userId", userId)).collect();
    const scheduled = (await Promise.all(rows.map(async (rsvp) => {
      const [event, occurrence] = await Promise.all([ctx.db.get(rsvp.eventId), ctx.db.get(rsvp.occurrenceId)]);
      if (!event || !occurrence) return null;
      return { eventId: `${event.provider.toLowerCase()}:${event.providerEventId}`, name: event.name, venue: occurrence.stage ?? event.venue, startAt: occurrence.startAt, endAt: occurrence.endAt, date: occurrence.dateLabel, time: occurrence.timeLabel, state: rsvp.state, status: occurrence.status };
    }))).filter((item): item is NonNullable<typeof item> => item !== null).sort((first, second) => (first.startAt ?? Number.MAX_SAFE_INTEGER) - (second.startAt ?? Number.MAX_SAFE_INTEGER));
    const active = scheduled.find((item) => item.startAt !== undefined && item.startAt <= serverTime && (item.endAt ?? item.startAt + 90 * 60 * 1000) > serverTime) ?? null;
    const next = scheduled.find((item) => item.startAt !== undefined && item.startAt > serverTime) ?? null;
    const knownTimes = scheduled.filter((item) => item.startAt !== undefined);
    const phase = scheduled.length === 0 ? "empty" : active ? "active" : next ? "before" : knownTimes.length ? "after" : "planned";
    return { phase, now: active, next, savedCount: scheduled.length, serverTime };
  },
});
