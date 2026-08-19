import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { detectScheduleConflicts } from "../lib/schedule";
import { mutation, query } from "./_generated/server";

export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { items: [], conflicts: [], decisions: [], serverTime: Date.now() };
    const rows = await ctx.db.query("rsvps").withIndex("by_user", (index) => index.eq("userId", userId)).collect();
    const items = (await Promise.all(rows.map(async (rsvp) => {
      const [event, occurrence] = await Promise.all([ctx.db.get(rsvp.eventId), ctx.db.get(rsvp.occurrenceId)]);
      if (!event || !occurrence) return null;
      return {
        rsvpId: rsvp._id,
        state: rsvp.state,
        eventId: `${event.provider.toLowerCase()}:${event.providerEventId}`,
        name: event.name,
        artists: event.artists,
        venue: event.venue,
        city: event.city,
        genre: event.genre,
        date: occurrence.dateLabel,
        time: occurrence.timeLabel,
        startAt: occurrence.startAt,
        endAt: occurrence.endAt,
        timeZone: occurrence.timeZone ?? event.timeZone,
        status: occurrence.status,
        source: event.provider,
        ticketUrl: event.ticketUrl,
        image: event.imageUrl ?? "linear-gradient(135deg,#3f2665,#d44d88)",
        lastVerifiedAt: occurrence.lastVerifiedAt,
      };
    }))).filter((item): item is NonNullable<typeof item> => item !== null).sort((first, second) => (first.startAt ?? Number.MAX_SAFE_INTEGER) - (second.startAt ?? Number.MAX_SAFE_INTEGER));
    const conflicts = detectScheduleConflicts(items.map((item) => ({ id: item.eventId, name: item.name, startAt: item.startAt, endAt: item.endAt })));
    const decisions = await ctx.db.query("scheduleDecisions").collect();
    return { items, conflicts, decisions: decisions.filter((decision) => decision.userId === userId), serverTime: Date.now() };
  },
});

export const resolveConflict = mutation({
  args: {
    conflictKey: v.string(),
    decision: v.union(v.literal("keep_both"), v.literal("keep_first"), v.literal("keep_second")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Sign in required.");
    const conflictKey = args.conflictKey.trim();
    if (!conflictKey || conflictKey.length > 360) throw new ConvexError("Invalid conflict.");
    const now = Date.now();
    const existing = await ctx.db.query("scheduleDecisions").withIndex("by_user_conflict", (index) => index.eq("userId", userId).eq("conflictKey", conflictKey)).unique();
    if (existing) await ctx.db.patch(existing._id, { decision: args.decision, updatedAt: now });
    else await ctx.db.insert("scheduleDecisions", { userId, conflictKey, decision: args.decision, createdAt: now, updatedAt: now });
    return { conflictKey, decision: args.decision, savedAt: now };
  },
});
