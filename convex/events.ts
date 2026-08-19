import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { query } from "./_generated/server";

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    provider: v.optional(v.union(v.literal("Ticketmaster"), v.literal("JamBase"))),
  },
  handler: async (ctx, { paginationOpts, provider }) => {
    const page = await ctx.db.query("events").withIndex("by_state", (index) => index.eq("state", "scheduled")).order("desc").paginate(paginationOpts);
    const verified = page.page.filter((event) => event.verificationState === "provider_verified");
    return { ...page, page: provider ? verified.filter((event) => event.provider === provider) : verified, serverTime: Date.now() };
  },
});

export const getByProviderId = query({
  args: { provider: v.union(v.literal("Ticketmaster"), v.literal("JamBase")), providerEventId: v.string() },
  handler: async (ctx, args) => {
    const event = await ctx.db.query("events").withIndex("by_provider_id", (index) => index.eq("provider", args.provider).eq("providerEventId", args.providerEventId)).unique();
    if (!event || event.verificationState !== "provider_verified") return null;
    const occurrences = await ctx.db.query("eventOccurrences").withIndex("by_event_start", (index) => index.eq("eventId", event._id)).collect();
    return { event, occurrences, serverTime: Date.now() };
  },
});
