import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

interface UsageRecord {
  timestamp: string;
  sessionId: string;
  url: string;
  ipAddress: string;
  userAgent: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const USAGE_FILE = path.join(DATA_DIR, "usage.json");
const MAX_RECORDS = 5000;

async function readUsage() {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    const existing = await readFile(USAGE_FILE, "utf-8");
    return JSON.parse(existing) as UsageRecord[];
  } catch {
    return [];
  }
}

export async function trackUsage(record: Omit<UsageRecord, "timestamp">) {
  const usage = await readUsage();

  usage.push({
    ...record,
    timestamp: new Date().toISOString(),
  });

  const trimmed = usage.slice(-MAX_RECORDS);
  await writeFile(USAGE_FILE, `${JSON.stringify(trimmed, null, 2)}\n`, "utf-8");
}
