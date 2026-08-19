import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

const displayNameValidator = v.string();

function normalizeDisplayName(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length < 2 || normalized.length > 30) {
    throw new ConvexError("Use a display name between 2 and 30 characters.");
  }
  return normalized;
}

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const [user, profile, privacy, notifications] = await Promise.all([
      ctx.db.get(userId),
      ctx.db.query("profiles").withIndex("by_user", (index) => index.eq("userId", userId)).unique(),
      ctx.db.query("privacySettings").withIndex("by_user", (index) => index.eq("userId", userId)).unique(),
      ctx.db.query("notificationSettings").withIndex("by_user", (index) => index.eq("userId", userId)).unique(),
    ]);
    if (!user) return null;
    return {
      email: user.email ?? "",
      displayName: profile?.displayName ?? user.displayName ?? user.name ?? user.email?.split("@")[0] ?? "Festival friend",
      avatarIcon: profile?.avatarIcon ?? "✦",
      activeEventId: profile?.activeEventId,
      provisioned: Boolean(profile && privacy && notifications),
    };
  },
});

export const provision = mutation({
  args: { displayName: v.optional(displayNameValidator) },
  handler: async (ctx, { displayName }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Sign in required.");
    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("Account could not be loaded.");
    const now = Date.now();
    const fallback = user.displayName ?? user.name ?? user.email?.split("@")[0] ?? "Festival friend";
    const normalized = normalizeDisplayName(displayName ?? fallback);

    const profile = await ctx.db.query("profiles").withIndex("by_user", (index) => index.eq("userId", userId)).unique();
    if (profile) await ctx.db.patch(profile._id, { displayName: normalized, updatedAt: now });
    else await ctx.db.insert("profiles", { userId, displayName: normalized, avatarIcon: "✦", createdAt: now, updatedAt: now });

    const privacy = await ctx.db.query("privacySettings").withIndex("by_user", (index) => index.eq("userId", userId)).unique();
    if (!privacy) {
      await ctx.db.insert("privacySettings", {
        userId,
        profileVisibility: "private",
        crewStatusVisibility: "crew",
        postDefaultVisibility: "private",
        updatedAt: now,
      });
    }

    const notifications = await ctx.db.query("notificationSettings").withIndex("by_user", (index) => index.eq("userId", userId)).unique();
    if (!notifications) {
      await ctx.db.insert("notificationSettings", {
        userId,
        scheduleChanges: true,
        crewInvites: true,
        eventReminders: true,
        marketing: false,
        updatedAt: now,
      });
    }

    await ctx.db.patch(userId, { displayName: normalized, name: normalized });
    return { displayName: normalized, provisioned: true, serverTime: now };
  },
});

export const updateProfile = mutation({
  args: { displayName: displayNameValidator, avatarIcon: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Sign in required.");
    const displayName = normalizeDisplayName(args.displayName);
    if (args.avatarIcon && !["✦", "☼", "✹", "☾", "♣", "◒"].includes(args.avatarIcon)) {
      throw new ConvexError("Choose a supported profile icon.");
    }
    const profile = await ctx.db.query("profiles").withIndex("by_user", (index) => index.eq("userId", userId)).unique();
    if (!profile) throw new ConvexError("Finish account setup before editing your profile.");
    const updatedAt = Date.now();
    await ctx.db.patch(profile._id, { displayName, avatarIcon: args.avatarIcon ?? profile.avatarIcon, updatedAt });
    await ctx.db.patch(userId, { displayName, name: displayName });
    return { displayName, avatarIcon: args.avatarIcon ?? profile.avatarIcon ?? "✦", updatedAt };
  },
});

export const settings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Sign in required.");
    const [privacy, notifications] = await Promise.all([
      ctx.db.query("privacySettings").withIndex("by_user", (index) => index.eq("userId", userId)).unique(),
      ctx.db.query("notificationSettings").withIndex("by_user", (index) => index.eq("userId", userId)).unique(),
    ]);
    return { privacy, notifications };
  },
});
