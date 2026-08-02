// ChatGPT Sites / Cloudflare Worker entry point.
// The generated Next static bundle is served through the platform Assets binding.
export default {
  async fetch(request, env) {
    const assets = env.ASSETS;
    if (!assets) return new Response("JamQuest static assets are unavailable.", { status: 503 });
    const response = await assets.fetch(request);
    if (response.status !== 404) return response;
    const url = new URL(request.url);
    if (request.method === "GET" && !url.pathname.includes(".")) {
      return assets.fetch(new Request(new URL("/", url), request));
    }
    return response;
  }
};
