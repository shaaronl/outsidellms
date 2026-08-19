import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { ConvexError } from "convex/values";

const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const password = Password({
  profile(params) {
    const email = typeof params.email === "string" ? params.email.trim().toLowerCase() : "";
    if (!emailPattern.test(email) || email.length > 254) throw new ConvexError("Enter a valid email address.");
    const rawDisplayName = typeof params.displayName === "string" ? params.displayName.trim() : "";
    if (rawDisplayName && (rawDisplayName.length < 2 || rawDisplayName.length > 30)) throw new ConvexError("Use a display name between 2 and 30 characters.");
    const profile: { email: string; [key: string]: string } = { email };
    if (rawDisplayName) { profile.displayName = rawDisplayName; profile.name = rawDisplayName; }
    return profile;
  },
  validatePasswordRequirements(value) {
    if (value.length < 8 || value.length > 128) throw new ConvexError("Use a password between 8 and 128 characters.");
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [password],
});
