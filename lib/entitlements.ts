import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

interface SessionEntitlement {
  email: string | null;
  purchasedAt: string;
}

interface EntitlementsStore {
  sessions: Record<string, SessionEntitlement>;
  emails: Record<string, string[]>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const ENTITLEMENTS_FILE = path.join(DATA_DIR, "entitlements.json");

const EMPTY_STORE: EntitlementsStore = {
  sessions: {},
  emails: {},
};

async function ensureStore() {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    await readFile(ENTITLEMENTS_FILE, "utf-8");
  } catch {
    await writeFile(
      ENTITLEMENTS_FILE,
      `${JSON.stringify(EMPTY_STORE, null, 2)}\n`,
      "utf-8",
    );
  }
}

async function readStore() {
  await ensureStore();
  const raw = await readFile(ENTITLEMENTS_FILE, "utf-8");
  return JSON.parse(raw) as EntitlementsStore;
}

async function writeStore(store: EntitlementsStore) {
  await writeFile(ENTITLEMENTS_FILE, `${JSON.stringify(store, null, 2)}\n`, "utf-8");
}

export async function grantEntitlement(sessionId: string, email?: string | null) {
  const store = await readStore();
  const normalizedEmail = email?.toLowerCase() ?? null;

  store.sessions[sessionId] = {
    email: normalizedEmail,
    purchasedAt: new Date().toISOString(),
  };

  if (normalizedEmail) {
    const sessions = new Set(store.emails[normalizedEmail] ?? []);
    sessions.add(sessionId);
    store.emails[normalizedEmail] = Array.from(sessions);
  }

  await writeStore(store);
}

export async function hasSessionEntitlement(sessionId: string) {
  const store = await readStore();
  return Boolean(store.sessions[sessionId]);
}

export async function hasEmailEntitlement(email: string) {
  const store = await readStore();
  const normalizedEmail = email.toLowerCase();
  return (store.emails[normalizedEmail] ?? []).length > 0;
}
