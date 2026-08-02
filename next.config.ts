import type { NextConfig } from "next";
// ChatGPT Sites' current artifact builder serves a static `dist` directory.
// The deployable demo therefore uses a static export; server adapters live in /server
// and activate only on a compatible server runtime.
const nextConfig: NextConfig = { output: "export", images: { unoptimized: true, remotePatterns: [] } };
export default nextConfig;
