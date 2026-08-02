import { events } from "@/lib/demo-data";
import type { EventRepository } from "./event-repository";
export const demoRepository: EventRepository = {
  async list({ query = "" }) { const needle = query.toLowerCase(); return { events: events.filter(e => !needle || `${e.name} ${e.venue} ${e.artists.join(" ")}`.toLowerCase().includes(needle)), source: "demo", refreshedAt: new Date().toISOString() }; },
  async setRsvp() { /* client demo state only; production uses an authorized server mutation */ }
};
