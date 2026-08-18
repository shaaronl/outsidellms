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

export const progressSchema = z.object({
  completedQuestIds: z.array(z.string().min(1).max(80)).max(32),
  coins: z.number().int().min(0).max(100000),
  chapterBonusAwarded: z.boolean(),
  displayName: z.string().trim().min(2).max(30),
  avatarIcon: z.enum(["✦", "☼", "✹", "☾", "♣", "◒"]),
  outfit: outfitSchema,
  favoriteArtists: z.array(z.object({ id: z.string().min(1).max(80), name: z.string().min(1).max(160), detail: z.string().max(240) })).max(3).default([]),
});

export type SavedProgress = z.infer<typeof progressSchema>;
