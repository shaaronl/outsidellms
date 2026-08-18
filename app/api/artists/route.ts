import { NextRequest, NextResponse } from "next/server";

type MusicBrainzArtist = { id?: string; name?: string; disambiguation?: string; country?: string; type?: string; area?: { name?: string }; tags?: Array<{ name?: string; count?: number }> };

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") || "").trim().slice(0, 80);
  if (query.length < 2) return NextResponse.json({ artists: [] });
  const parameters = new URLSearchParams({ query: `artist:${query}`, fmt: "json", limit: "10" });
  try {
    const response = await fetch(`https://musicbrainz.org/ws/2/artist/?${parameters}`, {
      headers: { Accept: "application/json", "User-Agent": "JamQuest/1.0 (festival field guide artist search)" },
      next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error("Artist catalog unavailable");
    const data = await response.json() as { artists?: MusicBrainzArtist[] };
    const artists = (data.artists || []).filter((artist) => artist.id && artist.name).map((artist) => ({
      id: artist.id as string,
      name: artist.name as string,
      detail: [artist.disambiguation, artist.type, artist.area?.name || artist.country, artist.tags?.sort((a, b) => (b.count || 0) - (a.count || 0))[0]?.name].filter(Boolean).slice(0, 2).join(" · ") || "MusicBrainz artist",
    }));
    return NextResponse.json({ artists }, { headers: { "Cache-Control": "private, max-age=300" } });
  } catch {
    return NextResponse.json({ error: "Artist search is taking a break. Try again shortly." }, { status: 502 });
  }
}
