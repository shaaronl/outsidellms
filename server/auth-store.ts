import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import type { SavedProgress } from "@/lib/progress-validation";

const scrypt = promisify(scryptCallback);
const storeDirectory = path.join(process.cwd(), ".data");
const storePath = path.join(storeDirectory, "accounts.json");
const sessionLifetime = 60 * 60 * 24 * 30;

type User = { id: string; email: string; displayName: string; passwordHash: string; passwordSalt: string; createdAt: number; progress?: SavedProgress };
type Session = { tokenHash: string; userId: string; expiresAt: number };
type Store = { users: User[]; sessions: Session[] };

async function load(): Promise<Store> {
  try { return JSON.parse(await readFile(storePath, "utf8")) as Store; }
  catch { return { users: [], sessions: [] }; }
}

async function save(store: Store) {
  await mkdir(storeDirectory, { recursive: true });
  const temporary = `${storePath}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(store, null, 2), { mode: 0o600 });
  await rename(temporary, storePath);
}

async function digest(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Buffer.from(bytes).toString("hex");
}

async function passwordHash(password: string, salt: string) {
  return Buffer.from(await scrypt(password, salt, 64) as Buffer).toString("hex");
}

async function issueSession(store: Store, userId: string) {
  const token = randomBytes(32).toString("base64url");
  store.sessions = store.sessions.filter((session) => session.expiresAt > Date.now());
  store.sessions.push({ tokenHash: await digest(token), userId, expiresAt: Date.now() + sessionLifetime * 1000 });
  await save(store);
  return token;
}

export async function register(email: string, password: string, displayName: string) {
  const store = await load();
  if (store.users.some((user) => user.email === email)) return { error: "ACCOUNT_EXISTS" as const };
  const salt = randomBytes(16).toString("hex");
  const user: User = { id: randomUUID(), email, displayName, passwordHash: await passwordHash(password, salt), passwordSalt: salt, createdAt: Date.now() };
  store.users.push(user);
  return { user, token: await issueSession(store, user.id) };
}

export async function login(email: string, password: string) {
  const store = await load();
  const user = store.users.find((candidate) => candidate.email === email);
  if (!user) return { error: "ACCOUNT_NOT_FOUND" as const };
  const actual = Buffer.from(await passwordHash(password, user.passwordSalt), "hex");
  const expected = Buffer.from(user.passwordHash, "hex");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return { error: "INVALID_PASSWORD" as const };
  return { user, token: await issueSession(store, user.id) };
}

export async function session(token?: string) {
  if (!token) return null;
  const store = await load();
  const tokenHash = await digest(token);
  const row = store.sessions.find((candidate) => candidate.tokenHash === tokenHash && candidate.expiresAt > Date.now());
  if (!row) return null;
  return store.users.find((user) => user.id === row.userId) || null;
}

export async function logout(token?: string) {
  if (!token) return;
  const store = await load();
  const tokenHash = await digest(token);
  store.sessions = store.sessions.filter((candidate) => candidate.tokenHash !== tokenHash);
  await save(store);
}

export async function getProgress(token?: string) {
  const user = await session(token);
  return user?.progress || null;
}

export async function saveProgress(token: string | undefined, progress: SavedProgress) {
  const current = await session(token);
  if (!current) return false;
  const store = await load();
  const user = store.users.find((candidate) => candidate.id === current.id);
  if (!user) return false;
  user.progress = progress;
  user.displayName = progress.displayName;
  await save(store);
  return true;
}

export const authCookie = { name: "jamquest_session", maxAge: sessionLifetime };
