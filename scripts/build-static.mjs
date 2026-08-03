import { cpSync, existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
const root = process.cwd(); const api = path.join(root, "app", "api"); const parked = path.join(root, "server", ".app-api-server-only");
try { if (existsSync(api)) renameSync(api, parked); execFileSync(path.join(root, "node_modules", ".bin", "next"), ["build"], { stdio: "inherit", env: { ...process.env, JAMQUEST_STATIC_BUILD: "1" } }); rmSync(path.join(root, "dist"), { recursive: true, force: true }); cpSync(path.join(root, "out"), path.join(root, "dist"), { recursive: true }); mkdirSync(path.join(root, "dist", "server"), { recursive: true }); mkdirSync(path.join(root, "dist", ".openai"), { recursive: true }); cpSync(path.join(root, "scripts", "sites-worker.js"), path.join(root, "dist", "server", "index.js")); cpSync(path.join(root, "scripts", "worker-hosting.json"), path.join(root, "dist", ".openai", "hosting.json")); }
finally { if (existsSync(parked)) renameSync(parked, api); }
