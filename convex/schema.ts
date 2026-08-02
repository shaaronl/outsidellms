// Convex schema blueprint. Install `convex` and generate types on a compatible host.
// All user-owned functions must derive userId from auth identity, never client input.
export const jamQuestTables = {
  users: ["authId", "username", "displayName", "homeLocation", "radiusMiles", "favoriteGenres", "favoriteArtistIds", "points", "streak", "profileVisibility", "createdAt", "updatedAt"],
  connectedAccounts: ["userId", "provider", "providerUserId", "encryptedTokenReference", "scopes", "expiresAt"],
  artists: ["canonicalId", "jamBaseId", "spotifyId", "name", "imageUrl", "genres", "metadata", "updatedAt"],
  venues: ["canonicalId", "jamBaseId", "name", "address", "city", "region", "country", "latitude", "longitude", "websiteUrl", "metadata", "updatedAt"],
  events: ["canonicalId", "jamBaseId", "name", "startAt", "endAt", "timezone", "venueId", "artistIds", "imageUrl", "ticketUrl", "sourceUrl", "status", "rawSourceVersion", "refreshedAt", "createdAt", "updatedAt"],
  rsvps: ["userId", "eventId", "status", "visibility", "createdAt", "updatedAt"],
  quests: ["title", "description", "instructions", "questType", "eventId", "venueId", "artistId", "startsAt", "endsAt", "points", "badgeKey", "proofType", "reviewMode", "status", "creatorType", "createdAt", "updatedAt"],
  submissions: ["userId", "questId", "eventId", "venueId", "imageStorageId", "imageUrl", "caption", "visibility", "status", "aiReviewId", "awardedPoints", "createdAt", "updatedAt"],
  aiReviews: ["submissionId", "model", "relevantToQuest", "confidence", "reasonCodes", "shortExplanation", "requiresHumanReview", "safetyFlags", "rawResponseReference", "createdAt"],
  friendTags: ["submissionId", "taggedUserId", "status", "createdAt", "respondedAt"],
  badges: ["key", "name", "description", "icon", "ruleType", "ruleConfig", "createdAt"],
  userBadges: ["userId", "badgeId", "earnedAt", "sourceSubmissionId"],
  feedItems: ["actorUserId", "type", "eventId", "venueId", "submissionId", "badgeId", "visibility", "createdAt"],
  likes: ["userId", "feedItemId", "createdAt"], comments: ["userId", "feedItemId", "body", "status", "createdAt", "updatedAt"],
  venueReviews: ["userId", "venueId", "eventId", "soundRating", "visibilityRating", "atmosphereRating", "accessibilityRating", "tip", "status", "createdAt", "updatedAt"],
  rewards: ["name", "description", "pointCost", "rewardType", "inventory", "active", "createdAt", "updatedAt"], redemptions: ["userId", "rewardId", "pointsSpent", "status", "createdAt", "updatedAt"], reports: ["reporterUserId", "targetType", "targetId", "reason", "details", "status", "createdAt", "resolvedAt"]
} as const;
export const indexes = ["events.by_startAt", "events.by_venueId_startAt", "quests.by_eventId_status", "submissions.by_userId_createdAt", "submissions.by_status", "feedItems.by_createdAt", "rsvps.by_userId_eventId", "badges.by_key", "comments.by_feedItemId", "reports.by_status"] as const;
