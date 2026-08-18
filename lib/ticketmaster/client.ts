import "server-only";
import type { Event } from "@/lib/types";

type Row = Record<string, unknown>;
const record = (value: unknown): Row => value && typeof value === "object" && !Array.isArray(value) ? value as Row : {};
const text = (value: unknown) => typeof value === "string" ? value : "";

export class TicketmasterError extends Error {
  constructor(public status: number, message: string) { super(message); this.name = "TicketmasterError"; }
}

function normalize(raw: Row): Event {
  const embedded = record(raw._embedded); const venues = Array.isArray(embedded.venues) ? embedded.venues.map(record) : []; const venue = venues[0] || {};
  const attractions = Array.isArray(embedded.attractions) ? embedded.attractions.map(record) : []; const dates = record(raw.dates); const start = record(dates.start);
  const classifications = Array.isArray(raw.classifications) ? raw.classifications.map(record) : []; const classification = classifications[0] || {}; const genre = record(classification.genre); const segment = record(classification.segment);
  const images = Array.isArray(raw.images) ? raw.images.map(record) : []; const image = images.sort((a, b) => Number(b.width || 0) - Number(a.width || 0))[0];
  const city = record(venue.city); const state = record(venue.state); const date = text(start.localDate); const time = text(start.localTime);
  return { id: `ticketmaster:${text(raw.id)}`, name: text(raw.name) || "Untitled event", date: date ? new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(new Date(`${date}T12:00:00`)) : "Date TBA", time: time ? new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(`${date || "2000-01-01"}T${time}`)) : "Time TBA", venue: text(venue.name) || "Venue TBA", city: [text(city.name), text(state.stateCode) || text(state.name)].filter(Boolean).join(", ") || "Location TBA", genre: text(genre.name) || text(segment.name) || "Live event", artists: attractions.map((item) => text(item.name)).filter(Boolean).length ? attractions.map((item) => text(item.name)).filter(Boolean) : [text(raw.name) || "Lineup TBA"], distance: 0, ticketUrl: text(raw.url) || undefined, source: "Ticketmaster", image: text(image.url) || "linear-gradient(135deg,#3f2665,#d44d88)", going: 0, interested: 0 };
}

export async function searchTicketmasterEvents(input: { city: string; query?: string; page?: number }) {
  const key = process.env.TICKETMASTER_API_KEY;
  if (!key) throw new TicketmasterError(503, "Ticketmaster is not configured.");
  const parameters = new URLSearchParams({ apikey: key, city: input.city.trim().slice(0, 80), size: "24", page: String(input.page || 0), sort: "date,asc", startDateTime: new Date().toISOString().replace(/\.\d{3}Z$/, "Z") });
  if (input.query?.trim()) parameters.set("keyword", input.query.trim().slice(0, 100));
  let response: Response;
  try { response = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?${parameters}`, { headers: { Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(10_000) }); }
  catch { throw new TicketmasterError(502, "Ticketmaster is temporarily unavailable."); }
  if (!response.ok) throw new TicketmasterError(response.status, response.status === 401 ? "The Ticketmaster API key was rejected." : "Ticketmaster could not load events.");
  const body = record(await response.json()); const embedded = record(body._embedded); const rows = Array.isArray(embedded.events) ? embedded.events.map(record) : [];
  return { events: rows.map(normalize), pagination: record(body.page), refreshedAt: new Date().toISOString() };
}
