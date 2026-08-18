import { z } from "zod";

const outfitSchema = z.object({
  body: z.enum(["Feminine", "Masculine", "Androgynous"]),
  skinTone: z.enum(["Fair", "Light", "Medium", "Tan", "Deep", "Rich"]),
  hair: z.enum(["Cropped", "Curls", "Long waves", "Braids"]),
  hat: z.enum(["None", "Beanie", "Bandana"]),
  top: z.enum(["Sun tee", "Mesh shirt", "Field jacket"]),
  bottom: z.enum(["Utility shorts", "Flares", "Cargo pants"]),
  accessory: z.enum(["Bandana", "Sunnies", "Pins"]),
  background: z.enum(["Golden fog", "Forest", "Blue sky"]),
});

const pulsePostSchema = z.object({
  id: z.string().min(1).max(80), user: z.string().min(1).max(80), handle: z.string().max(80), action: z.string().max(120), event: z.string().max(120), caption: z.string().max(280), points: z.number().int().min(0).max(100000).optional(), time: z.string().max(40), likes: z.number().int().min(0).max(100000), comments: z.number().int().min(0).max(100000), color: z.string().max(40),
});
const pulseCommentSchema = z.object({ id: z.string().min(1).max(100), text: z.string().min(1).max(280), replyTo: z.string().max(80).optional() });

export const progressSchema = z.object({
  completedQuestIds: z.array(z.string().min(1).max(80)).max(32),
  coins: z.number().int().min(0).max(100000),
  chapterBonusAwarded: z.boolean(),
  displayName: z.string().trim().min(2).max(30),
  avatarIcon: z.enum(["✦", "☼", "✹", "☾", "♣", "◒"]),
  outfit: outfitSchema,
  favoriteArtists: z.array(z.object({ id: z.string().min(1).max(80), name: z.string().min(1).max(160), detail: z.string().max(240) })).max(3).default([]),
  purchasedRewards: z.array(z.string().min(1).max(80)).max(24).default([]),
  equippedReward: z.string().max(80).default(""),
  pulseLikes: z.array(z.string().min(1).max(80)).max(200).default([]),
  pulsePosts: z.array(pulsePostSchema).max(100).default([]),
  pulseComments: z.record(z.string(), z.array(pulseCommentSchema).max(100)).default({}),
  pulseReported: z.array(z.string().min(1).max(160)).max(200).default([]),
});

export type SavedProgress = z.infer<typeof progressSchema>;
