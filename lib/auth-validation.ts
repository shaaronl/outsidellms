import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email().max(254);
export const passwordSchema = z.string().min(8).max(128);
export const loginSchema = z.object({ email: emailSchema, password: passwordSchema });
export const registrationSchema = loginSchema.extend({
  displayName: z.string().trim().min(2).max(30),
});
