import "server-only";
import type { Event } from "@/lib/types";

type Json = Record<string, unknown>;
type JbdEvent = { identifier?: unknown; name?: unknown; startDate?: unknown; image?: unknown; url?: unknown; eventStatus?: unknown; location?: unknown; performer?: unknown; offers?: unknown };
type JbdPage = { events?: unknown; cities?: unknown; pagination?: unknown };

export type JamBaseLocation = {
  id: string;
  label: string;
};

export class JamBaseError extends Error {
  constructor(public status: number, public retryAfterSeconds: number | null, message: string) { super(message); this.name = "JamBaseError"; }
}

const baseUrl = () => (process.env.JBD_BASE_URL || process.env.JAMBASE_API_BASE_URL || "https://api.data.jambase.com/v3").replace(/\/$/, "");
const apiKey = () => process.env.JBD_API_KEY || process.env.JAMBASE_API_KEY;
const asRecord = (value: unknown): Json => value && typeof value === "object" && !Array.isArray(value) ? value as Json : {};
const text = (value: unknown) => typeof value === "string" ? value : "";
const httpsUrl = (value: unknown) => { const raw = text(value); try { return new URL(raw).protocol === "https:" ? raw : undefined; } catch { return undefined; } };
const labelDate = (value: string) => value ? new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(new Date(value)) : "Date TBA";
const labelTime = (value: string) => value.includes("T") ? new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(value)) : "Time TBA";

function normalizeEvent(raw: JbdEvent): Event {
  const location = asRecord(raw.location);
  const address = asRecord(location.address);
  const performerRows = Array.isArray(raw.performer) ? raw.performer : [];
  const performers = performerRows.map((item) => text(asRecord(item).name)).filter(Boolean);
  const leadPerformer = asRecord(performerRows[0]);
  const genres = Array.isArray(leadPerformer.genre) ? leadPerformer.genre.map(text).filter(Boolean) : [];
  const offers = Array.isArray(raw.offers) ? raw.offers.map(asRecord) : [];
  const primaryOffer = offers.find((offer) => text(offer.category) === "ticketingLinkPrimary") ?? offers[0];
  const startAt = text(raw.startDate);
  return {
    id: text(raw.identifier) || `jambase:${crypto.randomUUID()}`,
    name: text(raw.name) || "Untitled event",
    date: labelDate(startAt), time: labelTime(startAt), venue: text(location.name) || "Venue TBA",
    city: [text(address.addressLocality), text(asRecord(address.addressRegion).alternateName || asRecord(address.addressRegion).name)].filter(Boolean).join(", ") || "Location TBA",
    genre: genres[0] || "Live music", artists: performers.length ? performers : ["Lineup TBA"], distance: 0,
    ticketUrl: primaryOffer ? httpsUrl(primaryOffer.url) : undefined, source: "JamBase",
    image: httpsUrl(raw.image) || "linear-gradient(135deg,#3f2665,#d44d88)", going: 0, interested: 0
  };
}

async function request(path: string): Promise<JbdPage> {
  const key = apiKey();
  if (!key) throw new JamBaseError(503, null, "JamBase is not configured. Add JBD_API_KEY to .env.local.");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetch(`${baseUrl()}${path}`, { headers: { Authorization: `Bearer ${key}`, Accept: "application/json", "User-Agent": "JamQuest/0.1" }, signal: controller.signal, cache: "no-store" });
      if (response.ok) return await response.json() as JbdPage;
      const retryAfter = response.headers.get("Retry-After");
      const retrySeconds = retryAfter && /^\d+$/.test(retryAfter) ? Number(retryAfter) : null;
      if ((response.status === 429 || response.status >= 500) && attempt < 2) { await new Promise((resolve) => setTimeout(resolve, (retrySeconds ? retrySeconds * 1000 : 500 * 2 ** attempt) + Math.random() * 150)); continue; }
      throw new JamBaseError(response.status, retrySeconds, response.status === 429 ? "JamBase rate limit reached. Please try again shortly." : `JamBase returned ${response.status}.`);
    } finally { clearTimeout(timeout); }
  }
  throw new JamBaseError(502, null, "JamBase is temporarily unavailable.");
}

export async function searchJamBaseEvents(input: { cityId?: string; metroId?: string; query?: string; searchKind?: "event" | "artist" | "venue"; page?: number }) {
  const params = new URLSearchParams({ perPage: "20", page: String(input.page || 1) });
  if (input.cityId) params.set("geoCityId", input.cityId);
  else params.set("geoMetroId", input.metroId || "jambase:1");
  if (input.query?.trim()) params.set(input.searchKind === "artist" ? "artistName" : input.searchKind === "venue" ? "venueName" : "name", input.query.trim().slice(0, 100));
  const body = await request(`/events?${params}`);
  const rows = Array.isArray(body.events) ? body.events.map(asRecord).map((event) => normalizeEvent(event)) : [];
  return { events: rows, pagination: asRecord(body.pagination), refreshedAt: new Date().toISOString() };
}

function normalizeLocation(raw: unknown): JamBaseLocation | null {
  const row = asRecord(raw);
  const id = text(row.identifier);
  const name = text(row.name);
  if (!/^jambase:\d+$/.test(id) || !name) return null;
  const region = asRecord(row.addressRegion);
  const regionName = text(region.alternateName) || text(region.name);
  const country = asRecord(row.country);
  const countryName = text(country.alternateName) || text(country.name);
  return { id, label: [name, regionName || countryName].filter(Boolean).join(", ") };
}

export async function searchJamBaseCities(query: string): Promise<JamBaseLocation[]> {
  const normalized = query.trim().slice(0, 80);
  if (!normalized) return [];
  const params = new URLSearchParams({ geoCityName: normalized, perPage: "8" });
  const body = await request(`/geographies/cities?${params}`);
  const cities = Array.isArray(body.cities) ? body.cities.map(normalizeLocation).filter((city): city is JamBaseLocation => Boolean(city)) : [];
  return cities;
}
