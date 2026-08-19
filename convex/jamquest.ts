import { ConvexError, v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { progressSchema } from "../lib/progress-validation";

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return {
      email: user.email || "",
      displayName: user.displayName || user.name || user.email?.split("@")[0] || "Festival friend",
    };
  },
});

export const getProgress = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Sign in required.");
    const record = await ctx.db.query("userProgress").withIndex("by_userId", (index) => index.eq("userId", userId)).unique();
    if (!record) return null;
    const parsed = progressSchema.safeParse(JSON.parse(record.payload));
    return parsed.success ? parsed.data : null;
  },
});

export const saveProgress = mutation({
  args: { payload: v.string() },
  handler: async (ctx, { payload }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Sign in required.");
    let decoded: unknown;
    try { decoded = JSON.parse(payload); } catch { throw new ConvexError("Invalid progress data."); }
    const parsed = progressSchema.safeParse(decoded);
    if (!parsed.success) throw new ConvexError("Invalid progress data.");
    const normalized = JSON.stringify({ ...parsed.data, rsvps: {} });
    const existing = await ctx.db.query("userProgress").withIndex("by_userId", (index) => index.eq("userId", userId)).unique();
    if (existing) await ctx.db.patch(existing._id, { payload: normalized, updatedAt: Date.now() });
    else await ctx.db.insert("userProgress", { userId, payload: normalized, updatedAt: Date.now() });
    await ctx.db.patch(userId, { displayName: parsed.data.displayName, name: parsed.data.displayName });
    return { saved: true };
  },
});
