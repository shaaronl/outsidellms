import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const provider = v.union(v.literal("Ticketmaster"), v.literal("JamBase"));
const rsvpState = v.union(v.literal("interested"), v.literal("going"));

export default defineSchema({
  ...authTables,

  // Convex Auth owns credentials and sessions. Product identity belongs in
  // profiles so public fields never accidentally expose private auth fields.
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    displayName: v.optional(v.string()),
  }).index("email", ["email"]),

  profiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    avatarIcon: v.optional(v.string()),
    activeEventId: v.optional(v.id("events")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  privacySettings: defineTable({
    userId: v.id("users"),
    profileVisibility: v.union(v.literal("private"), v.literal("crew")),
    crewStatusVisibility: v.union(v.literal("crew"), v.literal("private")),
    postDefaultVisibility: v.union(v.literal("crew"), v.literal("private")),
    termsVersion: v.optional(v.string()),
    privacyVersion: v.optional(v.string()),
    consentedAt: v.optional(v.number()),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  notificationSettings: defineTable({
    userId: v.id("users"),
    scheduleChanges: v.boolean(),
    crewInvites: v.boolean(),
    eventReminders: v.boolean(),
    marketing: v.boolean(),
    quietHoursStart: v.optional(v.string()),
    quietHoursEnd: v.optional(v.string()),
    timeZone: v.optional(v.string()),
    unsubscribedAt: v.optional(v.number()),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  events: defineTable({
    provider,
    providerEventId: v.string(),
    type: v.union(v.literal("festival"), v.literal("show")),
    name: v.string(),
    venue: v.string(),
    city: v.string(),
    genre: v.string(),
    artists: v.array(v.string()),
    imageUrl: v.optional(v.string()),
    ticketUrl: v.optional(v.string()),
    timeZone: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    state: v.union(v.literal("scheduled"), v.literal("postponed"), v.literal("cancelled")),
    verificationState: v.union(v.literal("client_snapshot"), v.literal("provider_verified")),
    observedAt: v.number(),
    lastVerifiedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_provider_id", ["provider", "providerEventId"])
    .index("by_state", ["state"]),

  eventOccurrences: defineTable({
    eventId: v.id("events"),
    providerOccurrenceId: v.string(),
    startAt: v.optional(v.number()),
    endAt: v.optional(v.number()),
    dateLabel: v.string(),
    timeLabel: v.string(),
    timeZone: v.optional(v.string()),
    stage: v.optional(v.string()),
    status: v.union(v.literal("scheduled"), v.literal("postponed"), v.literal("cancelled")),
    verificationState: v.union(v.literal("client_snapshot"), v.literal("provider_verified")),
    observedAt: v.number(),
    lastVerifiedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_provider_occurrence", ["providerOccurrenceId"])
    .index("by_event_start", ["eventId", "startAt"]),

  eventChanges: defineTable({
    eventId: v.id("events"),
    occurrenceId: v.optional(v.id("eventOccurrences")),
    changeType: v.string(),
    previousValue: v.optional(v.string()),
    currentValue: v.optional(v.string()),
    provider,
    observedAt: v.number(),
  }).index("by_event_observed", ["eventId", "observedAt"]),

  rsvps: defineTable({
    userId: v.id("users"),
    eventId: v.id("events"),
    occurrenceId: v.id("eventOccurrences"),
    state: rsvpState,
    idempotencyKey: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_event", ["userId", "eventId"])
    .index("by_user_occurrence", ["userId", "occurrenceId"]),

  scheduleDecisions: defineTable({
    userId: v.id("users"),
    conflictKey: v.string(),
    decision: v.union(v.literal("keep_both"), v.literal("keep_first"), v.literal("keep_second")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user_conflict", ["userId", "conflictKey"]),

  mapVersions: defineTable({
    eventId: v.id("events"),
    version: v.string(),
    state: v.union(v.literal("draft"), v.literal("published"), v.literal("retired")),
    sourceSummary: v.string(),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_event_state", ["eventId", "state"]),

  mapLocations: defineTable({
    eventId: v.id("events"),
    mapVersionId: v.id("mapVersions"),
    category: v.union(
      v.literal("water"),
      v.literal("medical"),
      v.literal("entrance"),
      v.literal("exit"),
      v.literal("accessibility"),
      v.literal("restroom"),
      v.literal("meetup")
    ),
    name: v.string(),
    zone: v.string(),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    coordinateConfidence: v.union(v.literal("official"), v.literal("estimated"), v.literal("area_only")),
    provenance: v.string(),
    hours: v.optional(v.string()),
    accessibility: v.optional(v.string()),
    verifiedAt: v.number(),
  }).index("by_version_category", ["mapVersionId", "category"]),

  offlineManifests: defineTable({
    eventId: v.id("events"),
    mapVersionId: v.id("mapVersions"),
    version: v.string(),
    recordIds: v.array(v.string()),
    assetUrls: v.array(v.string()),
    sizeBytes: v.number(),
    checksum: v.string(),
    publishedAt: v.number(),
  }).index("by_event_version", ["eventId", "version"]),

  featureFlags: defineTable({
    environment: v.union(v.literal("local"), v.literal("preview"), v.literal("production")),
    eventId: v.optional(v.id("events")),
    capability: v.string(),
    enabled: v.boolean(),
    reason: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_environment_capability", ["environment", "capability"]),

  accountExports: defineTable({
    userId: v.id("users"),
    state: v.union(v.literal("requested"), v.literal("processing"), v.literal("ready"), v.literal("expired"), v.literal("failed")),
    artifactReference: v.optional(v.string()),
    requestedAt: v.number(),
    completedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
  }).index("by_user_state", ["userId", "state"]),

  accountDeletionJobs: defineTable({
    userId: v.id("users"),
    state: v.union(v.literal("requested"), v.literal("processing"), v.literal("complete"), v.literal("failed")),
    requestedAt: v.number(),
    executeAt: v.number(),
    completedAt: v.optional(v.number()),
    retentionOutcome: v.optional(v.string()),
  }).index("by_user_state", ["userId", "state"]),

  // Transitional storage for the existing visual quest/profile prototype.
  // RSVPs and all new domains must not be written into this payload.
  userProgress: defineTable({
    userId: v.id("users"),
    payload: v.string(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),
});
