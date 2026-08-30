export type RsvpStatus = "interested" | "going" | "attended";

export type Event = {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  genre: string;
  artists: string[];
  distance: number;
  ticketUrl?: string;
  source: "demo" | "JamBase" | "Ticketmaster";
  image: string;
  going: number;
  interested: number;
  startAt?: number;
  endAt?: number;
  timeZone?: string;
  status?: "scheduled" | "postponed" | "cancelled";
  lastVerifiedAt?: number;
};
