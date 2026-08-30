import type { NextConfig } from "next";
// ChatGPT Sites' current artifact builder serves a static `dist` directory.
// The deployable demo therefore uses a static export; server adapters live in /server
// and activate only on a compatible server runtime.
const staticBuild = process.env.JAMQUEST_STATIC_BUILD === "1";
const nextConfig: NextConfig = { distDir: staticBuild ? ".next-static" : ".next", output: staticBuild ? "export" : undefined, allowedDevOrigins: ["127.0.0.1"], images: { unoptimized: true, remotePatterns: [] } };
export default nextConfig;
