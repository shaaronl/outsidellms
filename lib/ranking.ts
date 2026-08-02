import type { Event } from "./types";
export function rankEvent(event: Event, prefs: { artists: string[]; genres: string[]; maxDistance: number }) {
  const artist = event.artists.some((a) => prefs.artists.includes(a)) ? 45 : 0;
  const genre = prefs.genres.some((g) => event.genre.toLowerCase().includes(g.toLowerCase())) ? 20 : 0;
  const distance = Math.max(0, 20 - event.distance * 2);
  const social = Math.min(15, event.going / 8);
  return Math.round(artist + genre + distance + social);
}
export function rankingReason(event: Event) { return event.artists.includes("Nova Arcade") ? "Because you follow Nova Arcade and it’s close by." : `A ${event.genre.toLowerCase()} pick ${event.distance} mi from you.`; }
