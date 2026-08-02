import type { Event, FeedItem, Quest } from "./types";

export const events: Event[] = [
  { id: "e1", name: "Electric Bloom", date: "Fri, Aug 14", time: "8:00 PM", venue: "The Halcyon", city: "San Francisco, CA", genre: "Indie electronic", artists: ["Nova Arcade", "Mira Vale"], distance: 1.8, ticketUrl: "https://www.jambase.com", source: "demo", image: "linear-gradient(135deg,#6e45e2,#ec4899)", going: 37, interested: 91 },
  { id: "e2", name: "Golden Hour Sessions", date: "Sat, Aug 15", time: "6:30 PM", venue: "Mission Pavilion", city: "San Francisco, CA", genre: "Alternative", artists: ["The Paper Suns", "Cleo June"], distance: 2.4, ticketUrl: "https://www.jambase.com", source: "demo", image: "linear-gradient(135deg,#e67e22,#efc24d)", going: 84, interested: 203 },
  { id: "e3", name: "Midnight Transit", date: "Tue, Aug 18", time: "9:00 PM", venue: "Bayline Club", city: "Oakland, CA", genre: "House", artists: ["Orbit Theory", "KAI/RO"], distance: 8.6, ticketUrl: "https://www.jambase.com", source: "demo", image: "linear-gradient(135deg,#003973,#e5e5be)", going: 26, interested: 61 },
  { id: "e4", name: "Soft Focus Festival", date: "Sun, Aug 23", time: "2:00 PM", venue: "Civic Green", city: "San Francisco, CA", genre: "Dream pop", artists: ["Sunday Static", "Velvet Press"], distance: 3.1, source: "demo", image: "linear-gradient(135deg,#9b59b6,#3498db)", going: 112, interested: 310 }
];

export const quests: Quest[] = [
  { id: "q1", title: "Setlist wish", description: "Share the Nova Arcade song you hope opens the night.", type: "pre_event", points: 40, eventId: "e1", endsAt: "Aug 14 · 7:30 PM", proof: "text" },
  { id: "q2", title: "Find the light", description: "Capture a non-sensitive photo of the stage or venue atmosphere.", type: "at_event", points: 120, eventId: "e1", endsAt: "Aug 14 · 11:30 PM", proof: "photo" },
  { id: "q3", title: "Venue Scout", description: "Leave a useful entrance or transit tip for Mission Pavilion.", type: "venue", points: 80, venue: "Mission Pavilion", endsAt: "Always open", proof: "text" },
  { id: "q4", title: "Afterglow recap", description: "Tell the community your favorite moment after the show.", type: "post_event", points: 60, eventId: "e2", endsAt: "Aug 17", proof: "text" }
];

export const feed: FeedItem[] = [
  { id: "f1", user: "Maya Chen", handle: "@mayamakesnoise", action: "completed Find the light", event: "Electric Bloom", caption: "That opening synth wash was unreal. ✦", points: 120, time: "18m", likes: 24, comments: 5, color: "#ec4899" },
  { id: "f2", user: "Jordan Reyes", handle: "@jreyes", action: "is going to", event: "Golden Hour Sessions", caption: "First time at Mission Pavilion — any entrance tips?", time: "42m", likes: 11, comments: 8, color: "#f59e0b" },
  { id: "f3", user: "Dani Park", handle: "@danipark", action: "earned Venue Scout", event: "Mission Pavilion", caption: "North entrance is quieter; the 16 bus stops across the street.", points: 80, time: "2h", likes: 36, comments: 3, color: "#38bdf8" }
];

export const leaderboard = [
  ["Maya Chen", 1420, "#ec4899"], ["Jordan Reyes", 1180, "#f59e0b"], ["You", 860, "#a78bfa"], ["Dani Park", 745, "#38bdf8"], ["Sam Torres", 690, "#22c55e"]
];
