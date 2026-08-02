import type { Event } from "@/lib/types";
export interface EventRepository {
  list(input: { query?: string; city?: string }): Promise<{ events: Event[]; source: "demo" | "live"; refreshedAt: string }>;
  setRsvp(input: { userId: string; eventId: string; status: "interested" | "going" | "attended" }): Promise<void>;
}
