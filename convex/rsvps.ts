import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

const provider = v.union(v.literal("Ticketmaster"), v.literal("JamBase"));
const state = v.union(v.literal("interested"), v.literal("going"), v.literal("removed"));
const eventSnapshot = v.object({
  name: v.string(),
  type: v.union(v.literal("festival"), v.literal("show")),
  venue: v.string(),
  city: v.string(),
  genre: v.string(),
  artists: v.array(v.string()),
  imageUrl: v.optional(v.string()),
  ticketUrl: v.optional(v.string()),
  dateLabel: v.string(),
  timeLabel: v.string(),
  startAt: v.optional(v.number()),
  endAt: v.optional(v.number()),
  timeZone: v.optional(v.string()),
  status: v.union(v.literal("scheduled"), v.literal("postponed"), v.literal("cancelled")),
});

function cleanText(value: string, label: string, maximum: number) {
  const clean = value.trim().replace(/\s+/g, " ");
  if (!clean || clean.length > maximum) throw new ConvexError(`Invalid ${label}.`);
  return clean;
}

function safeHttps(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { byProviderId: {}, items: [], serverTime: Date.now() };
    const rows = await ctx.db.query("rsvps").withIndex("by_user", (index) => index.eq("userId", userId)).collect();
    const items = await Promise.all(rows.map(async (row) => {
      const [event, occurrence] = await Promise.all([ctx.db.get(row.eventId), ctx.db.get(row.occurrenceId)]);
      if (!event || !occurrence) return null;
      return {
        id: row._id,
        state: row.state,
        updatedAt: row.updatedAt,
        event: {
          id: `${event.provider.toLowerCase()}:${event.providerEventId}`,
          provider: event.provider,
          providerEventId: event.providerEventId,
          name: event.name,
          venue: event.venue,
          city: event.city,
          genre: event.genre,
          artists: event.artists,
          image: event.imageUrl ?? "linear-gradient(135deg,#3f2665,#d44d88)",
          ticketUrl: event.ticketUrl,
          source: event.provider,
          date: occurrence.dateLabel,
          time: occurrence.timeLabel,
          startAt: occurrence.startAt,
          endAt: occurrence.endAt,
          timeZone: occurrence.timeZone ?? event.timeZone,
          status: occurrence.status,
          lastVerifiedAt: occurrence.lastVerifiedAt,
          verificationState: occurrence.verificationState,
        },
      };
    }));
    const present = items.filter((item): item is NonNullable<typeof item> => item !== null);
    const byProviderId = Object.fromEntries(present.map((item) => [item.event.id, item.state]));
    return { byProviderId, items: present, serverTime: Date.now() };
  },
});

export const set = mutation({
  args: {
    provider,
    providerEventId: v.string(),
    nextState: state,
    idempotencyKey: v.string(),
    event: eventSnapshot,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Sign in required.");
    const providerEventId = cleanText(args.providerEventId, "event identifier", 160);
    const idempotencyKey = cleanText(args.idempotencyKey, "idempotency key", 160);
    const now = Date.now();
    const snapshot = args.event;
    if (snapshot.artists.length > 24 || snapshot.artists.some((artist) => !artist.trim() || artist.length > 160)) {
      throw new ConvexError("Invalid artist list.");
    }
    if (snapshot.startAt !== undefined && (!Number.isFinite(snapshot.startAt) || snapshot.startAt < 0)) throw new ConvexError("Invalid start time.");
    if (snapshot.endAt !== undefined && (snapshot.startAt === undefined || snapshot.endAt <= snapshot.startAt)) throw new ConvexError("Invalid end time.");

    let event = await ctx.db.query("events").withIndex("by_provider_id", (index) => index.eq("provider", args.provider).eq("providerEventId", providerEventId)).unique();
    const eventFields = {
      provider: args.provider,
      providerEventId,
      type: snapshot.type,
      name: cleanText(snapshot.name, "event name", 200),
      venue: cleanText(snapshot.venue, "venue", 200),
      city: cleanText(snapshot.city, "city", 160),
      genre: cleanText(snapshot.genre, "genre", 100),
      artists: snapshot.artists.map((artist) => artist.trim()),
      imageUrl: safeHttps(snapshot.imageUrl),
      ticketUrl: safeHttps(snapshot.ticketUrl),
      timeZone: snapshot.timeZone?.trim().slice(0, 80) || undefined,
      state: snapshot.status,
      verificationState: "client_snapshot" as const,
      observedAt: now,
      updatedAt: now,
    } as const;
    let eventId;
    if (event) {
      await ctx.db.patch(event._id, eventFields);
      eventId = event._id;
    } else {
      eventId = await ctx.db.insert("events", { ...eventFields, createdAt: now });
      event = await ctx.db.get(eventId);
    }

    const providerOccurrenceId = `${args.provider}:${providerEventId}:primary`;
    let occurrence = await ctx.db.query("eventOccurrences").withIndex("by_provider_occurrence", (index) => index.eq("providerOccurrenceId", providerOccurrenceId)).unique();
    const occurrenceFields = {
      eventId,
      providerOccurrenceId,
      startAt: snapshot.startAt,
      endAt: snapshot.endAt,
      dateLabel: cleanText(snapshot.dateLabel, "event date", 80),
      timeLabel: cleanText(snapshot.timeLabel, "event time", 80),
      timeZone: snapshot.timeZone?.trim().slice(0, 80) || undefined,
      status: snapshot.status,
      verificationState: "client_snapshot" as const,
      observedAt: now,
      updatedAt: now,
    } as const;
    let occurrenceId;
    if (occurrence) {
      await ctx.db.patch(occurrence._id, occurrenceFields);
      occurrenceId = occurrence._id;
    } else {
      occurrenceId = await ctx.db.insert("eventOccurrences", { ...occurrenceFields, createdAt: now });
      occurrence = await ctx.db.get(occurrenceId);
    }

    const existing = await ctx.db.query("rsvps").withIndex("by_user_occurrence", (index) => index.eq("userId", userId).eq("occurrenceId", occurrenceId)).unique();
    if (existing?.idempotencyKey === idempotencyKey) {
      return { saved: args.nextState !== "removed", state: existing.state, eventId: providerEventId, serverTime: now, idempotentReplay: true };
    }
    if (args.nextState === "removed") {
      if (existing) await ctx.db.delete(existing._id);
      return { saved: false, state: null, eventId: providerEventId, serverTime: now, idempotentReplay: false };
    }
    if (existing) await ctx.db.patch(existing._id, { state: args.nextState, idempotencyKey, updatedAt: now });
    else await ctx.db.insert("rsvps", { userId, eventId, occurrenceId, state: args.nextState, idempotencyKey, createdAt: now, updatedAt: now });
    return { saved: true, state: args.nextState, eventId: providerEventId, serverTime: now, idempotentReplay: false };
  },
});
