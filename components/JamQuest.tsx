"use client";

import { useEffect, useMemo, useState } from "react";
import { events, feed, leaderboard, quests } from "@/lib/demo-data";
import { rankEvent } from "@/lib/ranking";
import type { Event, FeedItem, RsvpStatus } from "@/lib/types";
import type { SavedProgress } from "@/lib/progress-validation";

type Location = { id: string; label: string };
type FestivalQuest = { id: string; number: string; title: string; task: string; time: string; verification: string; reward: number; unlock: string; icon: string; detail: string; choices?: string[]; action: "identity" | "avatar" | "crew" | "sound" | "map" | "qr" | "route" | "corner" };
type SearchKind = "event" | "artist" | "venue";
type AuthUser = { email: string; displayName: string };
type UnlockGuide = { title: string; description: string; destination: string; page: string; icon: string };
type ArtistChoice = { id: string; name: string; detail: string };
type Outfit = { body: "Feminine" | "Masculine" | "Androgynous"; skinTone: "Fair" | "Light" | "Medium" | "Tan" | "Deep" | "Rich"; hair: "Cropped" | "Curls" | "Long waves" | "Braids"; hat: "None" | "Beanie" | "Bandana"; top: "Sun tee" | "Mesh shirt" | "Field jacket"; bottom: "Utility shorts" | "Flares" | "Cargo pants"; accessory: "Bandana" | "Sunnies" | "Pins"; background: "Golden fog" | "Forest" | "Blue sky" };

const nav = [["feed", "Pulse"], ["discover", "Lineup"], ["quests", "Questbook"], ["map", "Map"], ["rewards", "Fog Coins"], ["profile", "You"]] as const;
const crewStatuses = ["At Lands End", "Near Twin Peaks", "Getting food", "Taking a break", "Heading to next set", "Find me at our meeting point"];
const demoLocations: Location[] = [
  { id: "jambase:4226966", label: "San Francisco" },
  { id: "jambase:1", label: "New York metro" },
  { id: "jambase:2", label: "Los Angeles" },
  { id: "jambase:3", label: "Chicago" },
];
const festivalQuests: FestivalQuest[] = [
  { id: "identity", number: "1.1", title: "Enter the Lands", task: "Create a display name and select a profile icon.", time: "20 seconds", verification: "Form submission", reward: 10, unlock: "Personal profile card", icon: "✦", detail: "A quick first signal that teaches people how their festival field guide works.", action: "identity" },
  { id: "avatar", number: "1.2", title: "Festival Fit", task: "Customize a simple illustrated avatar.", time: "30–60 seconds", verification: "Avatar customization saved", reward: 15, unlock: "Avatar Closet", icon: "◒", detail: "The initial quest provides a limited set of clothing. After completing it, players can purchase additional virtual clothing with Fog Coins.", choices: ["Hairstyle", "Hat", "Top", "Bottom", "Accessory", "Background"], action: "avatar" },
  { id: "crew", number: "1.3", title: "Build Your Crew", task: "Add at least one friend using a short code or shareable link.", time: "30 seconds", verification: "Friend code or shareable link", reward: 20, unlock: "Friend Tracker + Signal Scout badge", icon: "⌁", detail: "The tracker never reveals exact live coordinates. Friends voluntarily choose a temporary status that expires after 30 minutes unless updated.", choices: crewStatuses, action: "crew" },
  { id: "sound", number: "1.4", title: "Choose Your Sound", task: "Select three artists you love, two you might see, and three genres or moods.", time: "About 1 minute", verification: "Taste profile saved", reward: 20, unlock: "Personalized Artist Pins", icon: "♫", detail: "Artist pins can highlight the stage where selected artists are performing.", choices: ["3 artists you already love", "2 artists you might see", "3 preferred genres or moods"], action: "sound" },
  { id: "map", number: "1.5", title: "Know Before You Wander", task: "Open Water, Medical or wellness, and Entrances and exits.", time: "30 seconds", verification: "View all three map categories", reward: 25, unlock: "Quick Filters", icon: "⌖", detail: "Players only need to view these locations, not visit them. Safety information always remains available; the reward only unlocks a faster interface.", choices: ["Water", "Medical or wellness", "Entrances and exits"], action: "map" },
  { id: "signal", number: "1.5", title: "Claim Your First Signal", task: "Scan one rotating festival quest QR code near an entrance or information area.", time: "Under 20 seconds", verification: "Rotating QR scan", reward: 30, unlock: "Nearby Quest Pins", icon: "◫", detail: "The same rotating QR code should be available at several low-congestion entrances or information areas—not at one unique location.", action: "qr" },
  { id: "stage", number: "1.6", title: "Find Your Stage", task: "Choose the first artist you plan to see.", time: "30 seconds", verification: "Artist and route selected", reward: 20, unlock: "Stage Route Overlay", icon: "↗", detail: "The field guide displays their stage, approximate route, suggested departure time, and one nearby food, art, or rest location. The overlay appears only when requested and never tracks the player continuously.", action: "route" },
  { id: "corner", number: "1.7", title: "One New Corner", task: "Visit a festival region outside your first scheduled stage area.", time: "5–10 minutes", verification: "Regional QR scan or optional selfie upload", reward: 40, unlock: "Explored Regions Layer", icon: "◌", detail: "Explore art, community, food, fashion, or another performance area. Visited regions become colored on the player’s map after a valid proof is accepted.", choices: ["Art", "Community", "Food", "Fashion", "Another performance area"], action: "corner" },
];
const unlockGuides: Record<string, Omit<UnlockGuide, "title" | "icon">> = {
  identity: { description: "Your name, avatar, and festival stats now live together in your field guide.", destination: "Your Field Guide", page: "profile" },
  avatar: { description: "Return any time to switch hairstyles, hats, clothing, accessories, and backgrounds.", destination: "Festival Fit", page: "avatar" },
  crew: { description: "Set a temporary crew status so friends know your general plan without sharing live coordinates.", destination: "Build Your Crew", page: "crew" },
  sound: { description: "Your taste profile can now highlight artists and help you find their stages.", destination: "Artist Pins", page: "profile" },
  map: { description: "Water, wellness, and entrance filters are now ready for faster access.", destination: "Festival Map", page: "map" },
  signal: { description: "Nearby quest signals now appear as pins while you explore the festival map.", destination: "Festival Map", page: "map" },
  stage: { description: "Request a route to your selected stage whenever you need it—continuous tracking stays off.", destination: "Festival Map", page: "map" },
  corner: { description: "The places you have explored can now appear as a colored layer on your map.", destination: "Festival Map", page: "map" },
};

function Avatar({ name, icon = "✦", large = false }: { name: string; icon?: string; large?: boolean }) {
  return <span className={`festival-avatar ${large ? "large" : ""}`} aria-label={`${name}'s festival avatar`}>{icon}</span>;
}

function OutfitAvatar({ outfit, compact = false }: { outfit: Outfit; compact?: boolean }) {
  const backgrounds = { "Golden fog": "#f4c95d", Forest: "#76ad74", "Blue sky": "#72c9db" };
  const skinTones = { Fair: "#f6d3bd", Light: "#e8b18b", Medium: "#bf7958", Tan: "#9a5d3f", Deep: "#70402d", Rich: "#48291f" };
  const skin = skinTones[outfit.skinTone];
  return <div className={`outfit-avatar ${compact ? "compact" : ""}`} style={{ background: backgrounds[outfit.background] }} aria-label={`${outfit.body} avatar with ${outfit.skinTone.toLowerCase()} skin, ${outfit.hair} hair, ${outfit.hat} hat, ${outfit.top}, ${outfit.bottom}, and ${outfit.accessory}`}>
    <svg viewBox="0 0 240 310" role="img" aria-hidden="true">
      <path d="M48 288c29-25 116-25 145 0v22H48z" fill="#315f51" opacity=".25" />
      {outfit.hair === "Long waves" && <path d="M78 68c0-43 84-45 84 2v91h-18V82H96v79H77z" fill="#51382d" />}
      {outfit.hair === "Braids" && <path d="M87 76c-20 32 7 48-9 88M153 76c20 32-7 48 9 88" fill="none" stroke="#34292c" strokeWidth="11" strokeLinecap="round" />}
      <circle cx="120" cy="74" r="38" fill={skin} />
      <path d="M103 81h9M128 81h9" stroke="#33211f" strokeWidth="3" strokeLinecap="round" /><path d="M113 96c5 4 10 4 15 0" fill="none" stroke="#8c4d48" strokeWidth="2.5" strokeLinecap="round" />
      {outfit.hair === "Cropped" && <path d="M84 69c1-35 69-40 74 0l-14-10c-18 9-40 9-60 1z" fill="#2b2527" />}
      {outfit.hair === "Curls" && <><circle cx="91" cy="58" r="15" fill="#3b2928" /><circle cx="108" cy="48" r="17" fill="#3b2928" /><circle cx="128" cy="47" r="17" fill="#3b2928" /><circle cx="148" cy="58" r="15" fill="#3b2928" /><circle cx="119" cy="62" r="18" fill="#3b2928" /></>}
      {outfit.hair === "Long waves" && <path d="M82 68c1-39 76-43 78 1l-14-10c-17 10-40 10-64 2z" fill="#51382d" />}
      {outfit.hair === "Braids" && <><path d="M82 64c6-29 70-33 76 1l-12 9H94z" fill="#34292c" /><path d="M95 53l12 18M120 43v29M145 53l-12 18" fill="none" stroke="#8e654d" strokeWidth="3" /></>}
      {outfit.hat === "Beanie" && <><path d="M77 67c5-42 81-43 87 2l-10 9H87z" fill="#e85f4d" /><path d="M79 69h83v15H79z" fill="#f6d158" /></>}
      {outfit.hat === "Bandana" && <><path d="M78 59c27 11 57 11 84 0l-5 19c-24 8-50 8-74 0z" fill="#e85f4d" /><path d="M159 63l24 16-24 4z" fill="#f6d158" /></>}
      <path d="M104 109h32v26h-32z" fill={skin} />
      {outfit.top === "Sun tee" && <><path d="M78 132c14-14 70-14 84 0l13 95H65z" fill="#e86558" /><circle cx="120" cy="164" r="14" fill="#f7df54" /></>}
      {outfit.top === "Mesh shirt" && <><path d="M75 133c19-14 71-14 90 0l10 94H65z" fill="#3a7167" /><path d="M80 142h80M77 161h87M74 180h94M91 135v88M120 132v95M149 135v88" stroke="#b9e0c5" strokeWidth="4" opacity=".7" /></>}
      {outfit.top === "Field jacket" && <><path d="M75 132c18-16 71-16 90 0l10 95H65z" fill="#617c49" /><path d="M120 134v92M80 160h30M130 160h30" stroke="#e7d76c" strokeWidth="4" /></>}
      <path d="M105 226h30v61h-30z" fill={skin} />
      {outfit.bottom === "Utility shorts" && <path d="M87 220h66l8 52h-35l-6-30-7 30H79z" fill="#3d5055" />}
      {outfit.bottom === "Flares" && <path d="M91 220h58l13 68h-39l-3-44-3 44H78z" fill="#764f84" />}
      {outfit.bottom === "Cargo pants" && <><path d="M89 220h63l8 68h-31l-8-43-8 43H81z" fill="#71836c" /><path d="M82 249h22v18H80M137 249h22v18h-24" fill="#58715a" /></>}
      <path d="M90 287h31v9H87zM122 287h31v9h-34z" fill="#f8f0de" />
      {outfit.accessory === "Bandana" && <path d="M96 128h48l-24 27z" fill="#e85f4d" />}
      {outfit.accessory === "Sunnies" && <path d="M88 75h64M94 77a14 14 0 0027 0M119 77a14 14 0 0027 0" fill="none" stroke="#172e33" strokeWidth="5" />}
      {outfit.accessory === "Pins" && <><circle cx="98" cy="152" r="7" fill="#e85f4d" /><path d="M139 145l8 13h-16z" fill="#72c9db" /></>}
    </svg>
  </div>;
}

function EventCard({ event, rsvp, onRsvp, onOpen }: { event: Event; rsvp?: RsvpStatus; onRsvp: () => void; onOpen: () => void }) {
  const background = event.image.startsWith("https://") ? `linear-gradient(180deg,#10243255,#102432e6),url("${event.image}") center/cover` : event.image;
  return <article className="event-card" onClick={onOpen} tabIndex={0} onKeyDown={(eventKey) => eventKey.key === "Enter" && onOpen()}>
    <div className="poster" style={{ background }}><span>{event.date}</span><i>LINEUP</i></div>
    <div className="event-info"><p className="eyebrow">{event.genre} · {event.distance || "—"} mi</p><h3>{event.name}</h3><p>{event.artists.join(" · ")}</p><p className="muted">{event.venue} · {event.time}</p><div className="event-foot"><span><b>{event.going}</b> saved</span><button className={rsvp ? "chip active" : "chip"} onClick={(click) => { click.stopPropagation(); onRsvp(); }}>{rsvp === "going" ? "✓ Going" : "＋ Save set"}</button></div></div>
  </article>;
}

export default function JamQuest() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [progressReady, setProgressReady] = useState(false);
  const [authScreen, setAuthScreen] = useState(false);
  const [page, setPage] = useState("home");
  const [demo, setDemo] = useState(false);
  const [query, setQuery] = useState("");
  const [searchKind, setSearchKind] = useState<SearchKind>("event");
  const [eventData, setEventData] = useState<Event[]>(events);
  const [eventNotice, setEventNotice] = useState("Loading live lineup…");
  const [locationId, setLocationId] = useState("tm:New%20York");
  const [locationLabel, setLocationLabel] = useState("New York metro");
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState<Location[]>([]);
  const [locationNotice, setLocationNotice] = useState("");
  const [rsvps, setRsvps] = useState<Record<string, RsvpStatus>>({});
  const [selected, setSelected] = useState<Event | null>(null);
  const [coins, setCoins] = useState(45);
  const [completed, setCompleted] = useState<string[]>([]);
  const [chapterBonusAwarded, setChapterBonusAwarded] = useState(false);
  const [avatarIcon, setAvatarIcon] = useState("✦");
  const [outfit, setOutfit] = useState<Outfit>({ body: "Androgynous", skinTone: "Medium", hair: "Curls", hat: "Beanie", top: "Sun tee", bottom: "Utility shorts", accessory: "Bandana", background: "Golden fog" });
  const [displayName, setDisplayName] = useState("Ari Morgan");
  const [crewStatus, setCrewStatus] = useState("Taking a break");
  const [crewStatusExpiresAt, setCrewStatusExpiresAt] = useState(() => Date.now() + 30 * 60 * 1000);
  const [mapViews, setMapViews] = useState<string[]>([]);
  const [likes, setLikes] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [unlockGuide, setUnlockGuide] = useState<UnlockGuide | null>(null);
  const [favoriteArtists, setFavoriteArtists] = useState<ArtistChoice[]>([]);

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "same-origin" })
      .then(async (response) => response.ok ? (await response.json()).user as AuthUser : null)
      .then((user) => { setAuthUser(user); if (user?.displayName) setDisplayName(user.displayName); })
      .catch(() => setAuthUser(null))
      .finally(() => setAuthReady(true));
  }, []);
  useEffect(() => {
    if (!authUser) { setProgressReady(false); return; }
    let active = true;
    fetch("/api/progress", { credentials: "same-origin" })
      .then(async (response) => response.ok ? (await response.json()).progress as SavedProgress | null : null)
      .then((saved) => {
        if (!active || !saved) return;
        setCompleted(saved.completedQuestIds); setCoins(saved.coins); setChapterBonusAwarded(saved.chapterBonusAwarded);
        setDisplayName(saved.displayName); setAvatarIcon(saved.avatarIcon); setOutfit(saved.outfit); setFavoriteArtists(saved.favoriteArtists || []);
      })
      .finally(() => { if (active) setProgressReady(true); });
    return () => { active = false; };
  }, [authUser]);
  useEffect(() => {
    if (!authUser || !progressReady) return;
    const timer = window.setTimeout(() => {
      const progress: SavedProgress = { completedQuestIds: completed, coins, chapterBonusAwarded, displayName, avatarIcon: avatarIcon as SavedProgress["avatarIcon"], outfit, favoriteArtists };
      fetch("/api/progress", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(progress) }).catch(() => {});
    }, 350);
    return () => window.clearTimeout(timer);
  }, [authUser, progressReady, completed, coins, chapterBonusAwarded, displayName, avatarIcon, outfit, favoriteArtists]);
  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2800); };
  const go = (next: string) => { setSelected(null); setPage(next); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const complete = (quest: FestivalQuest) => {
    if (completed.includes(quest.id)) { showToast("That signal is already in your field guide."); return; }
    const next = [...completed, quest.id];
    const firstFour = festivalQuests.slice(0, 4).filter((item) => next.includes(item.id)).length;
    const chapterBonus = firstFour >= 3 && !chapterBonusAwarded;
    setCompleted(next); setCoins((current) => current + quest.reward + (chapterBonus ? 50 : 0));
    if (chapterBonus) setChapterBonusAwarded(true);
    const guide = unlockGuides[quest.id];
    if (guide) setUnlockGuide({ ...guide, title: quest.unlock, icon: quest.icon });
    showToast(chapterBonus ? `+${quest.reward + 50} Fog Coins · Chapter 1 bonus unlocked` : `+${quest.reward} Fog Coins · ${quest.unlock} unlocked`);
  };
  const updateCrewStatus = (status: string) => { setCrewStatus(status); setCrewStatusExpiresAt(Date.now() + 30 * 60 * 1000); };
  const openQuest = (quest: FestivalQuest) => {
    if (quest.action === "identity") go("onboarding");
    else if (quest.action === "avatar") go("avatar");
    else if (quest.action === "crew") go("crew");
    else if (quest.action === "sound") go("profile");
    else if (quest.action === "map" || quest.action === "route") go("map");
    else if (quest.action === "qr") complete(quest);
    else complete(quest);
  };

  useEffect(() => {
    const controller = new AbortController();
    setEventData([]); setEventNotice(`Loading live events near ${locationLabel}…`);
    const timer = window.setTimeout(() => {
      const parameters = new URLSearchParams(locationId === "jambase:1" ? { geoMetroId: locationId } : { geoCityId: locationId });
      if (query.trim()) { parameters.set("q", query.trim()); parameters.set("type", searchKind); }
      fetch(`/api/events?${parameters}`, { signal: controller.signal })
        .then(async (response) => { if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || "Live lineup unavailable."); return response.json(); })
        .then((data) => { if (Array.isArray(data.events)) { setEventData(data.events); setEventNotice(data.events.length ? `Live JamBase lineup · refreshed ${new Date(data.refreshedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "No live shows matched that search."); } })
        .catch((error: Error) => { if (error.name !== "AbortError") { setEventData([]); setEventNotice(error.message.includes("configured") ? "Live concert data is not connected yet." : `Live events near ${locationLabel} are temporarily unavailable. Try again shortly.`); } });
    }, query ? 400 : 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [locationId, locationLabel, query, searchKind]);
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (crewStatusExpiresAt <= Date.now() && crewStatus) { setCrewStatus(""); setToast("Your crew status expired after 30 minutes."); }
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [crewStatus, crewStatusExpiresAt]);

  const findLocation = async () => {
    if (locationQuery.trim().length < 2) { setLocationNotice("Enter a city, such as San Francisco."); return; }
    setLocationNotice("Finding festival city…"); setLocationResults([]);
    try { const response = await fetch(`/api/locations?q=${encodeURIComponent(locationQuery.trim())}`); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to look up that city."); const matches = Array.isArray(data.locations) ? data.locations : []; setLocationResults(matches); setLocationNotice(matches.length ? "Choose a city to load its real upcoming events." : "No matching city was found."); } catch { const needle = locationQuery.trim().toLowerCase(); const matches = demoLocations.filter((location) => location.label.toLowerCase().includes(needle)); setLocationResults(matches); setLocationNotice(matches.length ? "The live concert connection needs an API key. You can choose this city now, but no demo events will be shown as real listings." : "Live city search is not connected yet. Add a JamBase API key to search any supported city."); }
  };
  const chooseLocation = (location: Location) => { setLocationId(location.id); setLocationLabel(location.label); setLocationResults([]); setLocationQuery(""); setQuery(""); setLocationNotice(`Lineup set for ${location.label}.`); };
  const lineup = useMemo(() => eventData.filter((item) => { if (!query) return true; const needle = query.toLowerCase(); const haystack = searchKind === "artist" ? item.artists.join(" ") : searchKind === "venue" ? item.venue : item.name; return haystack.toLowerCase().includes(needle); }).sort((a, b) => rankEvent(b, { artists: ["Nova Arcade"], genres: ["indie", "alternative"], maxDistance: 20 }) - rankEvent(a, { artists: ["Nova Arcade"], genres: ["indie", "alternative"], maxDistance: 20 })), [eventData, query, searchKind]);
  const chapterProgress = festivalQuests.filter((quest) => completed.includes(quest.id)).length;

  if (!demo && page === "home") {
    if (authScreen) {
      if (!authReady) return <AuthLoading />;
      return <AuthGate onAuthenticated={(user, isNew) => { setProgressReady(false); setAuthUser(user); setDisplayName(user.displayName); setDemo(true); go(isNew ? "onboarding" : "quests"); }} />;
    }
    return <Landing explore={() => { setDemo(true); go("quests"); }} enter={() => setAuthScreen(true)} />;
  }
  if (authUser && !progressReady) return <AuthLoading />;
  if (selected) return <><Shell page="discover" go={go} coins={coins} icon={avatarIcon} /><main className="app"><button className="back" onClick={() => setSelected(null)}>← Back to lineup</button><EventDetail event={selected} rsvp={rsvps[selected.id]} onRsvp={() => setRsvps((current) => ({ ...current, [selected.id]: current[selected.id] === "going" ? "interested" : "going" }))} onQuest={() => go("quests")} /></main><Toast text={toast} /></>;

  return <><Shell page={page} go={go} coins={coins} icon={avatarIcon} /><main className="app">
    {page === "feed" && <Feed likes={likes} toggleLike={(id) => setLikes((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])} />}
    {page === "discover" && <Discover events={lineup} notice={eventNotice} query={query} setQuery={setQuery} searchKind={searchKind} setSearchKind={setSearchKind} locationLabel={locationLabel} locationQuery={locationQuery} setLocationQuery={setLocationQuery} locationResults={locationResults} locationNotice={locationNotice} findLocation={findLocation} chooseLocation={chooseLocation} rsvps={rsvps} onRsvp={(id) => setRsvps((current) => ({ ...current, [id]: current[id] === "going" ? "interested" : "going" }))} onOpen={setSelected} />}
    {page === "quests" && <Questbook coins={coins} completed={completed} progress={chapterProgress} chapterBonusAwarded={chapterBonusAwarded} openQuest={openQuest} />}
    {page === "map" && <FestivalMap mapViews={mapViews} setMapViews={setMapViews} completed={completed} complete={complete} />}
    {page === "rewards" && <Rewards coins={coins} />}
    {page === "profile" && <Profile name={displayName} email={authUser?.email} icon={avatarIcon} outfit={outfit} coins={coins} completed={completed} favoriteArtists={favoriteArtists} setFavoriteArtists={setFavoriteArtists} go={go} complete={complete} signOut={authUser ? async () => { await fetch("/api/auth/logout", { method: "POST" }); setProgressReady(false); setAuthUser(null); setAuthScreen(false); setPage("home"); setDemo(false); } : undefined} />}
    {page === "onboarding" && <Identity name={displayName} setName={setDisplayName} icon={avatarIcon} setIcon={setAvatarIcon} finish={() => { complete(festivalQuests[0]); go("avatar"); }} />}
    {page === "avatar" && <AvatarCloset icon={avatarIcon} setIcon={setAvatarIcon} outfit={outfit} setOutfit={setOutfit} finish={() => { complete(festivalQuests[1]); go("quests"); }} />}
    {page === "crew" && <Crew status={crewStatus} setStatus={updateCrewStatus} expiresAt={crewStatusExpiresAt} finish={() => { complete(festivalQuests[2]); go("quests"); }} />}
  </main><MobileNav page={page} go={go} /><UnlockNotice guide={unlockGuide} open={() => { if (unlockGuide) go(unlockGuide.page); setUnlockGuide(null); }} dismiss={() => setUnlockGuide(null)} /><Toast text={toast} /></>;
}

function AuthLoading() {
  return <main className="auth-page"><div className="auth-card auth-loading" aria-live="polite"><b className="brand">jam<span>quest</span></b><div className="signal-loader">✦</div><p>Finding your field guide…</p></div></main>;
}

function AuthGate({ onAuthenticated }: { onAuthenticated: (user: AuthUser, isNew: boolean) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, displayName }) });
      const data = await response.json();
      if (!response.ok) {
        if (data.code === "ACCOUNT_NOT_FOUND") { setMode("register"); setError("We couldn’t find that account. Create it below to enter the Lands."); }
        else setError(data.error || "Unable to continue right now.");
        return;
      }
      onAuthenticated(data.user, mode === "register");
    } catch { setError("JamQuest could not reach the account service. Please try again."); }
    finally { setBusy(false); }
  };
  const changeMode = (next: "login" | "register") => { setMode(next); setError(""); };
  return <main className="auth-page"><section className="auth-card"><div className="auth-brand"><b className="brand">jam<span>quest</span></b><span>FESTIVAL FIELD GUIDE</span></div><p className="kicker">{mode === "login" ? "WELCOME BACK" : "YOUR FIRST SIGNAL"}</p><h1>{mode === "login" ? "Enter the Lands." : "Create your field guide."}</h1><p>{mode === "login" ? "Sign in to pick up your saved sets, crew signals, and Fog Coins." : "Make an account to save your festival plans and quest progress."}</p><form onSubmit={submit}>{mode === "register" && <label>Display name<input autoComplete="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} minLength={2} maxLength={30} required placeholder="How your crew sees you" /></label>}<label>Email<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" /></label><label>Password<input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} maxLength={128} required placeholder="At least 8 characters" /></label>{error && <p className="auth-error" role="alert">{error}</p>}<button className="primary full" disabled={busy}>{busy ? "Following the signal…" : mode === "login" ? "Sign in →" : "Create account →"}</button></form><div className="auth-switch"><span>{mode === "login" ? "New to JamQuest?" : "Already have an account?"}</span><button type="button" onClick={() => changeMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "Create an account" : "Sign in instead"}</button></div><p className="auth-privacy">Passwords are hashed before storage. Your account keeps your festival guide private to you.</p></section><aside className="auth-poster"><span>CHAPTER 01</span><b>THE SIGNAL<br />STARTS HERE</b><p>Plan lightly. Wander wisely. Keep your crew close without sharing exact live locations.</p></aside></main>;
}

function Landing({ explore, enter }: { explore: () => void; enter: () => void }) { return <main className="landing outside-lands"><nav className="landing-nav"><b className="brand">jam<span>quest</span></b><span className="fan-made">FESTIVAL FIELD GUIDE · DEMO</span><button className="ghost" onClick={explore}>Explore questbook</button></nav><section className="hero"><p className="kicker">OUTSIDE LANDS, YOUR WAY</p><h1>Find your<br /><em>foggy little world.</em></h1><p className="hero-copy">A colorful, fan-made festival companion for planning sets, building your crew, and collecting small moments—without tracking anyone’s exact location.</p><div className="hero-actions"><button className="primary" onClick={enter}>Enter the Lands <span>→</span></button></div><div className="festival-stamp"><span>CHAPTER 01</span><b>THE SIGNAL<br />STARTS HERE</b><i>Fog Coin field guide</i></div></section><section className="how"><p className="kicker">HOW THE FIELD GUIDE WORKS</p><h2>Set a plan. Leave room for wonder.</h2><div className="steps"><div><i>01</i><h3>Make your mark</h3><p>Build an avatar, save artists, and shape a crew that can find each other safely.</p></div><div><i>02</i><h3>Follow signals</h3><p>Complete small quests and pick up Fog Coins for virtual festival upgrades.</p></div><div><i>03</i><h3>Wander smarter</h3><p>Use optional routes and status check-ins—not continuous location tracking.</p></div></div></section></main>; }
function Shell({ page, go, coins, icon }: { page: string; go: (page: string) => void; coins: number; icon: string }) { return <header className="topbar outside-header"><button className="brand" onClick={() => go("quests")}>jam<span>quest</span></button><nav>{nav.slice(0, 5).map(([id, label]) => <button className={page === id ? "nav-on" : ""} key={id} onClick={() => go(id)}>{label}</button>)}</nav><div className="top-right"><button className="coin-counter" onClick={() => go("rewards")} aria-label="Open Fog Coin rewards"><span>✹</span>{coins}</button><button onClick={() => go("profile")}><Avatar name="Profile" icon={icon} /></button></div></header>; }
function MobileNav({ page, go }: { page: string; go: (page: string) => void }) { return <nav className="mobile-nav">{nav.slice(0, 5).map(([id, label]) => <button key={id} className={page === id ? "active" : ""} onClick={() => go(id)}><i>{id === "quests" ? "✦" : id === "map" ? "⌖" : id === "discover" ? "♫" : id === "rewards" ? "✹" : "◌"}</i><span>{label}</span></button>)}</nav>; }

function Questbook({ coins, completed, progress, chapterBonusAwarded, openQuest }: { coins: number; completed: string[]; progress: number; chapterBonusAwarded: boolean; openQuest: (quest: FestivalQuest) => void }) { const [expanded, setExpanded] = useState<string | null>("identity"); const total = festivalQuests.length; const percentage = Math.round((progress / total) * 100); return <section className="questbook"><div className="chapter-hero"><div><p className="kicker">CHAPTER 01 · ONBOARDING</p><h1>Create your festival identity.</h1><p>These are very easy quests designed to teach people how the website works. They do not require continuous location tracking.</p></div><div className="chapter-progress"><span>SIGNAL PROGRESS</span><b>{percentage}%</b><div><i style={{ width: `${percentage}%` }} /></div><small>{progress} of {total} chapter quests completed</small></div></div><div className="chapter-completion"><span>CHAPTER 1 COMPLETION</span><b>Complete 3 of 4 · Bonus +50 Fog Coins</b><p>{chapterBonusAwarded ? "Bonus claimed. Keep completing quests to reach 100% chapter progress." : "Complete any three of the first four identity quests to claim the +50 Fog Coin bonus."}</p></div><div className="quest-summary"><span><b>✹ {coins}</b> Fog Coins</span><span><b>{progress}/{total}</b> chapter signals claimed</span><span><b>30 min</b> crew status expiry</span></div><div className="quest-list">{festivalQuests.map((quest) => <QuestCard key={quest.id} quest={quest} complete={completed.includes(quest.id)} expanded={expanded === quest.id} toggle={() => setExpanded((current) => current === quest.id ? null : quest.id)} open={() => openQuest(quest)} />)}</div></section>; }
function QuestCard({ quest, complete, expanded, toggle, open }: { quest: FestivalQuest; complete: boolean; expanded: boolean; toggle: () => void; open: () => void }) { return <article className={`festival-quest ${complete ? "complete" : ""} ${expanded ? "expanded" : ""}`}><div className="quest-number">{quest.number}</div><div className="quest-icon">{complete ? "✓" : quest.icon}</div><div className="quest-main"><p className="eyebrow">{complete ? "SIGNAL CLAIMED" : "CHAPTER 01 QUEST"}</p><h3>{quest.title}</h3><p>{quest.task}</p><span className="unlock">Unlocks: {quest.unlock}</span>{expanded && <div className="quest-detail"><div><span>TIME</span><b>{quest.time}</b></div><div><span>VERIFICATION</span><b>{quest.verification}</b></div><p>{quest.detail}</p>{quest.choices && <div className="detail-chips">{quest.choices.map((choice) => <span key={choice}>{choice}</span>)}</div>}</div>}</div><div className="quest-reward"><b>+{quest.reward}</b><span>Fog Coins</span><button className="text-button" onClick={toggle}>{expanded ? "Hide details" : "Details"}</button><button className={complete ? "outline" : "primary"} onClick={open}>{complete ? "View" : "Start"}</button></div></article>; }

function Identity({ name, setName, icon, setIcon, finish }: { name: string; setName: (value: string) => void; icon: string; setIcon: (value: string) => void; finish: () => void }) { return <section className="form-page"><p className="kicker">QUEST 1.1 · 20 SEC</p><h1>Enter the Lands.</h1><p>Choose the name and signal that will appear in your field guide.</p><label>Display name<input value={name} maxLength={30} onChange={(event) => setName(event.target.value)} /></label><p className="label">Choose a profile icon</p><div className="icon-picker">{["✦", "☼", "✹", "☾", "♣", "◒"].map((option) => <button key={option} className={icon === option ? "selected" : ""} onClick={() => setIcon(option)}>{option}</button>)}</div><button className="primary" disabled={name.trim().length < 2} onClick={finish}>Claim 10 Fog Coins →</button></section>; }
function AvatarCloset({ icon, setIcon, outfit, setOutfit, finish }: { icon: string; setIcon: (value: string) => void; outfit: Outfit; setOutfit: (outfit: Outfit) => void; finish: () => void }) {
  const options: Record<keyof Outfit, Outfit[keyof Outfit][]> = { body: ["Feminine", "Masculine", "Androgynous"], skinTone: ["Fair", "Light", "Medium", "Tan", "Deep", "Rich"], hair: ["Cropped", "Curls", "Long waves", "Braids"], hat: ["None", "Beanie", "Bandana"], top: ["Sun tee", "Mesh shirt", "Field jacket"], bottom: ["Utility shorts", "Flares", "Cargo pants"], accessory: ["Bandana", "Sunnies", "Pins"], background: ["Golden fog", "Forest", "Blue sky"] };
  const labels: Partial<Record<keyof Outfit, string>> = { body: "Avatar style", skinTone: "Skin tone", hair: "Hair", hat: "Hat" };
  return <section className="closet"><p className="kicker">QUEST 1.2 · 30–60 SEC</p><h1>Festival fit.</h1><p>Make the avatar feel like you. Choose a style, hairstyle, optional hat, skin tone, and festival layers.</p><div className="avatar-builder"><OutfitAvatar outfit={outfit} /><div className="fit-recap"><span>YOUR LOOK</span><b>{outfit.top}</b><p>{outfit.body} · {outfit.skinTone} skin · {outfit.hair} hair · {outfit.hat === "None" ? "No hat" : outfit.hat} · {outfit.bottom}</p><small>Initial closet items are free. Future virtual fits can be purchased with Fog Coins.</small></div></div><div className="closet-grid">{(Object.entries(options) as [keyof Outfit, Outfit[keyof Outfit][]][]).map(([key, values]) => <fieldset key={key}><legend>{labels[key] || key}</legend>{values.map((value) => <button key={value} className={outfit[key] === value ? "selected" : ""} onClick={() => setOutfit({ ...outfit, [key]: value } as Outfit)}>{value}</button>)}</fieldset>)}</div><p className="label">Profile icon</p><div className="icon-picker mini">{["✦", "☼", "✹", "☾", "♣", "◒"].map((option) => <button key={option} className={icon === option ? "selected" : ""} onClick={() => setIcon(option)}>{option}</button>)}</div><button className="primary" onClick={finish}>Save festival fit · +15 Fog Coins</button></section>;
}
function Crew({ status, setStatus, expiresAt, finish }: { status: string; setStatus: (status: string) => void; expiresAt: number; finish: () => void }) { const [friend, setFriend] = useState(""); const minutes = Math.max(0, Math.ceil((expiresAt - Date.now()) / 60_000)); return <section className="crew-page"><p className="kicker">QUEST 1.3 · 30 SEC</p><h1>Build your crew.</h1><p>Share a temporary status—never your exact coordinates. Each status expires after 30 minutes.</p><div className="crew-code"><span>YOUR CREW CODE</span><b>FOG-72Q</b><button className="outline" onClick={() => navigator.clipboard?.writeText("FOG-72Q").then(() => {})}>Copy code</button></div><label>Add a friend code<input value={friend} onChange={(event) => setFriend(event.target.value)} placeholder="e.g. MIST-14X" /></label><div className="status-grid">{crewStatuses.map((option) => <button key={option} className={status === option ? "selected" : ""} onClick={() => setStatus(option)}>{option}</button>)}</div><p className="status-expiry">Current status: <b>{status || "No current status"}</b>{status ? ` · clears in ${minutes} min` : ""}</p><button className="primary" disabled={friend.trim().length < 3} onClick={finish}>Add friend · +20 Fog Coins</button></section>; }

function FestivalMap({ mapViews, setMapViews, completed, complete }: { mapViews: string[]; setMapViews: (values: string[]) => void; completed: string[]; complete: (quest: FestivalQuest) => void }) {
  const [routeShown, setRouteShown] = useState(false);
  const places = { "Festival area": { lat: 37.7694, lon: -122.4862 }, "Lands End": { lat: 37.7714, lon: -122.4895 }, "Twin Peaks": { lat: 37.7668, lon: -122.4837 }, Panhandle: { lat: 37.7657, lon: -122.4902 }, "Medical & wellness": { lat: 37.7679, lon: -122.4856 }, "Entrances & exits": { lat: 37.7647, lon: -122.4878 } };
  const waterStations = [{ label: "Lands End refill", detail: "Main-stage water refill quest pin", lat: 37.7714, lon: -122.4895 }, { label: "Twin Peaks refill", detail: "Twin Peaks water refill quest pin", lat: 37.7668, lon: -122.4837 }, { label: "Panhandle refill", detail: "Panhandle water refill quest pin", lat: 37.7657, lon: -122.4902 }];
  const [focus, setFocus] = useState<{ label: string; lat: number; lon: number }>({ label: "Festival area", ...places["Festival area"] });
  const [activeSafety, setActiveSafety] = useState<string | null>(null);
  const safety = ["Water", "Medical & wellness", "Entrances & exits"];
  const allSafety = safety.every((item) => mapViews.includes(item));
  const hasNearbyPins = completed.includes("signal");
  const hasExploredLayer = completed.includes("corner");
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${focus.lon - .008}%2C${focus.lat - .005}%2C${focus.lon + .008}%2C${focus.lat + .005}&layer=mapnik&marker=${focus.lat}%2C${focus.lon}`;
  const setPlace = (label: keyof typeof places) => setFocus({ label, ...places[label] });
  const showWaterStation = (station: typeof waterStations[number]) => { setFocus(station); setActiveSafety("Water"); setMapViews(mapViews.includes("Water") ? mapViews : [...mapViews, "Water"]); };
  const viewSafety = (item: string) => { setActiveSafety(item); setMapViews(mapViews.includes(item) ? mapViews : [...mapViews, item]); if (item === "Water") showWaterStation(waterStations[0]); else setPlace(item as "Medical & wellness" | "Entrances & exits"); };
  const requestRoute = () => { setRouteShown(true); complete(festivalQuests[6]); };
  return <section className="map-page"><div className="page-head"><div><p className="kicker">OUTSIDE LANDS FIELD MAP</p><h1>Wander with a plan.</h1><p className="muted">A real Golden Gate Park map with hardcoded festival planning pins. It never tracks your position or your friends.</p></div><span className="map-key">No live tracking</span></div><div className="map-selector">{["Festival area", "Lands End", "Twin Peaks", "Panhandle"].map((place) => <button key={place} className={focus.label === place ? "selected" : ""} onClick={() => setPlace(place as keyof typeof places)}>{place}</button>)}</div><div className="real-map"><iframe key={mapUrl} title={`OpenStreetMap centered on ${focus.label}`} src={mapUrl} loading="lazy" referrerPolicy="no-referrer" /><div><b>{focus.label}</b><a href={`https://www.openstreetmap.org/?mlat=${focus.lat}&mlon=${focus.lon}#map=16/${focus.lat}/${focus.lon}`} target="_blank" rel="noreferrer">Open larger map ↗</a></div></div><div className="station-list" aria-label="Water refill quest locations"><div><p className="eyebrow">WATER REFILL QUEST PINS</p><p>Choose a refill point to center the real map.</p></div>{waterStations.map((station) => <button key={station.label} className={focus.label === station.label ? "selected" : ""} onClick={() => showWaterStation(station)}><span>💧</span><b>{station.label}</b><small>{station.detail}</small></button>)}</div><p className="map-caption">Water refill stations are available throughout Outside Lands. These hardcoded quest pins are planning references until the official 2026 festival map publishes exact locations.</p><div className="map-tools"><div><p className="eyebrow">ESSENTIALS · ALWAYS AVAILABLE</p><div className="map-chips">{safety.map((item) => <button key={item} className={mapViews.includes(item) ? "seen" : ""} onClick={() => viewSafety(item)}>{mapViews.includes(item) ? "✓ " : ""}{item}</button>)}</div></div><div><p className="eyebrow">QUICK FILTERS · QUEST UNLOCK</p><div className="map-chips"><button disabled={!completed.includes("map")} onClick={() => viewSafety("Water")}>Water</button><button disabled={!completed.includes("map")} onClick={() => viewSafety("Medical & wellness")}>Wellness</button><button disabled={!completed.includes("map")} onClick={() => viewSafety("Entrances & exits")}>Entrances</button></div></div></div>{allSafety && !completed.includes("map") && <button className="primary" onClick={() => complete(festivalQuests[4])}>Claim safety signal · +25 Fog Coins</button>}<div className="map-actions"><button className={routeShown ? "outline" : "primary"} onClick={requestRoute}>{routeShown ? "Route overlay active" : "Request stage route · +20 Fog Coins"}</button><button className={hasNearbyPins ? "outline" : "primary"} onClick={() => complete(festivalQuests[5])}>{hasNearbyPins ? "Nearby quest pins active" : "Demo QR scan · +30 Fog Coins"}</button><button className={hasExploredLayer ? "outline" : "primary"} onClick={() => complete(festivalQuests[7])}>{hasExploredLayer ? "Explored regions active" : "Demo regional proof · +40 Fog Coins"}</button></div><div className="route-callout"><span>✦</span><div><b>Map note</b><p>Outside Lands confirms free refill stations throughout the grounds. Check the official map once published for final station placement.</p></div></div></section>;
}

function Discover({ events: shown, notice, query, setQuery, searchKind, setSearchKind, locationLabel, locationQuery, setLocationQuery, locationResults, locationNotice, findLocation, chooseLocation, rsvps, onRsvp, onOpen }: { events: Event[]; notice: string; query: string; setQuery: (value: string) => void; searchKind: SearchKind; setSearchKind: (value: SearchKind) => void; locationLabel: string; locationQuery: string; setLocationQuery: (value: string) => void; locationResults: Location[]; locationNotice: string; findLocation: () => void; chooseLocation: (location: Location) => void; rsvps: Record<string, RsvpStatus>; onRsvp: (id: string) => void; onOpen: (event: Event) => void }) { const placeholder = searchKind === "artist" ? "Search an artist, e.g. Billie Eilish" : searchKind === "venue" ? "Search a venue, e.g. The Fillmore" : "Search an event title, e.g. Outside Lands"; return <section><div className="lineup-hero"><p className="kicker">LIVE LINEUP EXPLORER</p><h1>Catch a feeling.<br /><em>Then catch the set.</em></h1><p>{notice}</p></div><form className="location-search" onSubmit={(event) => { event.preventDefault(); findLocation(); }}><label>Event city<input value={locationQuery} onChange={(event) => setLocationQuery(event.target.value)} placeholder="City, e.g. San Francisco" /></label><button className="outline" type="submit">Find city</button></form>{locationNotice && <p className="location-note" role="status">{locationNotice}</p>}{locationResults.length > 0 && <div className="location-results">{locationResults.map((location) => <button key={location.id} type="button" onClick={() => chooseLocation(location)}>{location.label}</button>)}</div>}<div className="discover-tools"><label className="search">⌕ <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} /></label><label className="search-kind">Search by<select value={searchKind} onChange={(event) => setSearchKind(event.target.value as SearchKind)}><option value="event">Event title</option><option value="artist">Artist</option><option value="venue">Venue</option></select></label></div><p className="search-help">Results come from JamBase and are filtered to the selected city. Search again by event, artist, or venue.</p><div className="section-title"><h2>Upcoming near {locationLabel}</h2><span>{shown.length} live listings</span></div><div className="event-grid">{shown.map((event) => <EventCard key={event.id} event={event} rsvp={rsvps[event.id]} onRsvp={() => onRsvp(event.id)} onOpen={() => onOpen(event)} />)}</div>{!shown.length && <div className="empty"><b>No live listings loaded for {locationLabel}.</b><span>{notice}</span></div>}</section>; }
function EventDetail({ event, rsvp, onRsvp, onQuest }: { event: Event; rsvp?: RsvpStatus; onRsvp: () => void; onQuest: () => void }) { return <section><div className="detail-hero festival-detail" style={{ background: event.image }}><div className="hero-overlay"><p>{event.genre.toUpperCase()} · FIELD GUIDE PICK</p><h1>{event.name}</h1><p>{event.artists.join(" · ")}</p></div></div><div className="detail-grid"><div><div className="date-row"><b>{event.date}</b><span>{event.time}</span><span>·</span><span>{event.venue}, {event.city}</span></div><p className="source">Live listings: JamBase when available · ticket buttons go to a third-party destination.</p><div className="rsvp-row"><button className={rsvp === "going" ? "rsvp yes" : "rsvp"} onClick={onRsvp}>{rsvp === "going" ? "✓ Saved to your plan" : "＋ Save this set"}</button>{event.ticketUrl && <a className="primary" href={event.ticketUrl} target="_blank" rel="noreferrer">Tickets ↗</a>}</div><section className="detail-section"><div className="section-title"><h2>Quest signals</h2><span>Make the day yours</span></div><div className="route-callout"><span>✦</span><div><b>Find your stage</b><p>See an optional route and a nearby food or rest stop. No continuous tracking required.</p></div><button className="outline" onClick={onQuest}>Open questbook</button></div></section></div><aside className="side-card"><p className="eyebrow">FIELD NOTE</p><h3>Plan lightly.</h3><p>Save a few sets, leave room for a new corner, and use your crew status if plans change.</p><hr /><b>Privacy first</b><p className="muted">Crew updates are voluntary and clear after 30 minutes.</p></aside></div></section>; }
function Feed({ likes, toggleLike }: { likes: string[]; toggleLike: (id: string) => void }) { return <section className="feed-wrap"><div className="feed-head"><div><p className="kicker">THE FIELD NOTES</p><h1>Little moments<br /><em>in the fog.</em></h1></div><span className="map-key">Crew-safe feed</span></div><div className="story-row">{[["Maya", "☼"], ["Jordan", "✦"], ["Dani", "◒"], ["You", "✹"]].map(([name, icon]) => <div key={name}><Avatar name={name} icon={icon} /><span>{name}</span></div>)}</div><div className="feed-list">{feed.map((item: FeedItem) => <article className="feed-card" key={item.id}><header><Avatar name={item.user} icon="✦" /><div><b>{item.user}</b><p>{item.action} <strong>{item.event}</strong> · {item.time}</p></div></header>{item.points && <div className="feed-visual" style={{ background: `linear-gradient(130deg, ${item.color}, #07303a)` }}><span>SIGNAL CLAIMED</span><b>{item.event}</b><i>✹ +{item.points} Fog Coins</i></div>}<p className="caption">{item.caption}</p><footer><button className={likes.includes(item.id) ? "liked" : ""} onClick={() => toggleLike(item.id)}>♥ {item.likes + (likes.includes(item.id) ? 1 : 0)}</button><button>◌ {item.comments}</button><button>Report</button></footer></article>)}</div></section>; }
function Rewards({ coins }: { coins: number }) { const rewards = [["Mossy profile frame", "60", "◌"], ["Golden-hour backdrop", "120", "☼"], ["Foggy field fit", "180", "♣"], ["Raffle placeholder", "250", "✦"]]; return <section><div className="page-head"><div><p className="kicker">FOG COIN EXCHANGE</p><h1>Keep it virtual.<br /><em>Keep it yours.</em></h1><p className="muted">Cosmetic upgrades and placeholders only. Fog Coins have no cash value.</p></div><div className="coin-stack"><span>YOUR BALANCE</span><b>✹ {coins}</b></div></div><div className="reward-hero festival-reward"><span>CHAPTER 01 BONUS</span><b>+50 Fog Coins</b><p>Claim it by completing any three of the first four identity quests.</p></div><div className="reward-grid">{rewards.map(([name, cost, icon]) => <article key={name}><i>{icon}</i><h3>{name}</h3><p>{cost} Fog Coins</p><button className="outline" disabled={Number(cost) > coins}>Preview</button></article>)}</div></section>; }
function Profile({ name, email, icon, outfit, coins, completed, favoriteArtists, setFavoriteArtists, go, complete, signOut }: { name: string; email?: string; icon: string; outfit: Outfit; coins: number; completed: string[]; favoriteArtists: ArtistChoice[]; setFavoriteArtists: (artists: ArtistChoice[]) => void; go: (page: string) => void; complete: (quest: FestivalQuest) => void; signOut?: () => void }) { const sound = festivalQuests[3]; return <section className="profile"><div className="profile-hero festival-profile"><OutfitAvatar outfit={outfit} compact /><div><p className="kicker">YOUR FIELD GUIDE</p><h1>{name} <span>{icon}</span></h1><p>{email ? `${email} · ` : "Demo field guide · "}Outside Lands fan guide</p></div><button className="outline" onClick={() => go("avatar")}>Edit fit</button></div><div className="stat-row"><div><b>✹ {coins}</b><span>Fog Coins</span></div><div><b>{completed.length}</b><span>signals</span></div><div><b>3</b><span>saved sets</span></div><div><b>30m</b><span>status timer</span></div></div><div className="profile-grid"><div className="sound-card"><p className="eyebrow">CHOOSE YOUR SOUND</p><h2>Who are you a fan of?</h2><p>Search the global artist catalog and choose exactly three favorites. Your picks save automatically to your account.</p><ArtistPicker selected={favoriteArtists} setSelected={setFavoriteArtists} /><button className={completed.includes(sound.id) ? "outline" : "primary"} disabled={favoriteArtists.length !== 3 || completed.includes(sound.id)} onClick={() => complete(sound)}>{completed.includes(sound.id) ? "✓ Artist pins active" : favoriteArtists.length === 3 ? "Save three artists · +20 Fog Coins" : `Choose ${3 - favoriteArtists.length} more artist${3 - favoriteArtists.length === 1 ? "" : "s"}`}</button></div><div><p className="eyebrow">YOUR FESTIVAL FIT</p><p className="fit-summary">{outfit.body} · {outfit.skinTone} skin · {outfit.hair} hair · {outfit.hat === "None" ? "No hat" : outfit.hat} · {outfit.top}</p><button className="outline" onClick={() => go("avatar")}>Customize outfit</button></div><div><p className="eyebrow">EARNED SIGNALS</p><div className="badge-grid compact">{["First signal", "Signal Scout", "Map reader"].map((badge, index) => <article className={index === 1 && !completed.includes("crew") ? "locked" : ""} key={badge}><i>{index === 1 ? "⌁" : "✦"}</i><b>{badge}</b><span>{index === 1 && !completed.includes("crew") ? "Locked" : "Earned"}</span></article>)}</div></div>{signOut && <div><p className="eyebrow">ACCOUNT</p><h2>Your JamQuest login</h2><p className="muted">Sign out on this device. Your account and field guide remain saved.</p><button className="outline" onClick={signOut}>Sign out</button></div>}</div></section>; }
function ArtistPicker({ selected, setSelected }: { selected: ArtistChoice[]; setSelected: (artists: ArtistChoice[]) => void }) {
  const [query, setQuery] = useState(""); const [results, setResults] = useState<ArtistChoice[]>([]); const [status, setStatus] = useState("");
  useEffect(() => { if (query.trim().length < 2) { setResults([]); setStatus(""); return; } const controller = new AbortController(); setStatus("Searching artists…"); const timer = window.setTimeout(() => fetch(`/api/artists?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal }).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setResults(data.artists || []); setStatus((data.artists || []).length ? "" : "No artists found. Try another spelling."); }).catch((error: Error) => { if (error.name !== "AbortError") setStatus(error.message || "Artist search is unavailable."); }), 350); return () => { window.clearTimeout(timer); controller.abort(); }; }, [query]);
  const toggle = (artist: ArtistChoice) => { const exists = selected.some((item) => item.id === artist.id); if (exists) setSelected(selected.filter((item) => item.id !== artist.id)); else if (selected.length < 3) setSelected([...selected, artist]); };
  return <div className="artist-picker"><div className="selected-artists" aria-label={`${selected.length} of 3 favorite artists selected`}>{selected.length ? selected.map((artist) => <button type="button" key={artist.id} onClick={() => toggle(artist)}>{artist.name} <span>×</span></button>) : <span>Your three artist pins will appear here.</span>}</div><label className="artist-search">⌕ <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search artists, e.g. Chappell Roan" aria-label="Search the artist catalog" /></label>{status && <p className="artist-status" role="status">{status}</p>}{results.length > 0 && <div className="artist-results">{results.map((artist) => { const chosen = selected.some((item) => item.id === artist.id); return <button type="button" key={artist.id} className={chosen ? "chosen" : ""} disabled={!chosen && selected.length >= 3} onClick={() => toggle(artist)}><span>{chosen ? "✓" : "+"}</span><div><b>{artist.name}</b><small>{artist.detail}</small></div></button>; })}</div>}<small className="catalog-credit">Artist search powered by MusicBrainz.</small></div>;
}
function Toast({ text }: { text: string }) { return text ? <div className="toast" role="status">{text}</div> : null; }
function UnlockNotice({ guide, open, dismiss }: { guide: UnlockGuide | null; open: () => void; dismiss: () => void }) {
  if (!guide) return null;
  return <aside className="unlock-guide" role="dialog" aria-modal="false" aria-labelledby="unlock-guide-title">
    <div className="unlock-guide-head"><span aria-hidden="true">{guide.icon}</span><div><p>FEATURE UNLOCKED</p><h2 id="unlock-guide-title">{guide.title}</h2></div><button type="button" onClick={dismiss} aria-label="Dismiss unlock guide">×</button></div>
    <p>{guide.description}</p>
    <div className="unlock-guide-actions"><button className="primary" type="button" onClick={open}>Find it in {guide.destination} →</button><button className="text-button" type="button" onClick={dismiss}>Maybe later</button></div>
  </aside>;
}
