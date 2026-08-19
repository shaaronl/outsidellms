export type RsvpStatus = "interested" | "going" | "attended";
export type QuestType = "pre_event" | "at_event" | "post_event" | "venue";
export type SubmissionStatus = "draft" | "submitted" | "reviewing" | "accepted" | "needs_review" | "rejected" | "removed";

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
export type Quest = { id: string; title: string; description: string; type: QuestType; points: number; eventId?: string; venue?: string; endsAt: string; proof: "photo" | "text" | "check-in" };
export type FeedItem = { id: string; user: string; handle: string; action: string; event: string; caption: string; points?: number; time: string; likes: number; comments: number; color: string };
export type AiReview = { relevantToQuest: boolean; confidence: number; reasonCodes: string[]; shortExplanation: string; requiresHumanReview: boolean; safetyFlags: string[] };
