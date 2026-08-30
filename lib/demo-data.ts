import type { Event } from "./types";

export const events: Event[] = [
  { id: "e1", name: "Electric Bloom", date: "Fri, Aug 14", time: "8:00 PM", venue: "The Halcyon", city: "San Francisco, CA", genre: "Indie electronic", artists: ["Nova Arcade", "Mira Vale"], distance: 1.8, ticketUrl: "https://www.jambase.com", source: "demo", image: "linear-gradient(135deg,#6e45e2,#ec4899)", going: 37, interested: 91 },
  { id: "e2", name: "Golden Hour Sessions", date: "Sat, Aug 15", time: "6:30 PM", venue: "Mission Pavilion", city: "San Francisco, CA", genre: "Alternative", artists: ["The Paper Suns", "Cleo June"], distance: 2.4, ticketUrl: "https://www.jambase.com", source: "demo", image: "linear-gradient(135deg,#e67e22,#efc24d)", going: 84, interested: 203 },
  { id: "e3", name: "Midnight Transit", date: "Tue, Aug 18", time: "9:00 PM", venue: "Bayline Club", city: "Oakland, CA", genre: "House", artists: ["Orbit Theory", "KAI/RO"], distance: 8.6, ticketUrl: "https://www.jambase.com", source: "demo", image: "linear-gradient(135deg,#003973,#e5e5be)", going: 26, interested: 61 },
  { id: "e4", name: "Soft Focus Festival", date: "Sun, Aug 23", time: "2:00 PM", venue: "Civic Green", city: "San Francisco, CA", genre: "Dream pop", artists: ["Sunday Static", "Velvet Press"], distance: 3.1, source: "demo", image: "linear-gradient(135deg,#9b59b6,#3498db)", going: 112, interested: 310 }
];
