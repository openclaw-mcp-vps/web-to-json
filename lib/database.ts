import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type PurchaseRecord = {
  email: string;
  orderId: string;
  productId?: string;
  status: "active" | "cancelled" | "refunded";
  sourceEvent: string;
  createdAt: string;
  updatedAt: string;
};

export type ExtractionRecord = {
  email: string;
  url: string;
  provider: string;
  createdAt: string;
};

type DatabaseSchema = {
  purchases: PurchaseRecord[];
  extractions: ExtractionRecord[];
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

let writeQueue: Promise<void> = Promise.resolve();

async function ensureDatabaseFile() {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    await readFile(DATA_FILE, "utf8");
  } catch {
    const initialData: DatabaseSchema = {
      purchases: [],
      extractions: []
    };

    await writeFile(DATA_FILE, JSON.stringify(initialData, null, 2), "utf8");
  }
}

async function readDatabase(): Promise<DatabaseSchema> {
  await ensureDatabaseFile();
  const raw = await readFile(DATA_FILE, "utf8");

  try {
    const parsed = JSON.parse(raw) as DatabaseSchema;

    return {
      purchases: Array.isArray(parsed.purchases) ? parsed.purchases : [],
      extractions: Array.isArray(parsed.extractions) ? parsed.extractions : []
    };
  } catch {
    return {
      purchases: [],
      extractions: []
    };
  }
}

async function writeDatabase(db: DatabaseSchema) {
  await writeFile(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
}

async function withWriteLock<T>(fn: () => Promise<T>) {
  const next = writeQueue.then(fn, fn);
  writeQueue = next.then(
    () => undefined,
    () => undefined
  );

  return await next;
}

export async function upsertPurchase(input: {
  email: string;
  orderId: string;
  productId?: string;
  status: "active" | "cancelled" | "refunded";
  sourceEvent: string;
}) {
  return await withWriteLock(async () => {
    const db = await readDatabase();
    const now = new Date().toISOString();
    const normalizedEmail = input.email.trim().toLowerCase();
    const existingIndex = db.purchases.findIndex(
      (row) => row.email === normalizedEmail && row.orderId === input.orderId
    );

    const nextRecord: PurchaseRecord = {
      email: normalizedEmail,
      orderId: input.orderId,
      productId: input.productId,
      status: input.status,
      sourceEvent: input.sourceEvent,
      createdAt:
        existingIndex >= 0 ? db.purchases[existingIndex].createdAt : now,
      updatedAt: now
    };

    if (existingIndex >= 0) {
      db.purchases[existingIndex] = nextRecord;
    } else {
      db.purchases.push(nextRecord);
    }

    await writeDatabase(db);
    return nextRecord;
  });
}

export async function findActivePurchaseByEmail(email: string) {
  const db = await readDatabase();
  const normalizedEmail = email.trim().toLowerCase();

  return (
    db.purchases.find(
      (row) => row.email === normalizedEmail && row.status === "active"
    ) ?? null
  );
}

export async function logExtraction(input: {
  email: string;
  url: string;
  provider: string;
}) {
  return await withWriteLock(async () => {
    const db = await readDatabase();

    db.extractions.push({
      email: input.email.trim().toLowerCase(),
      url: input.url,
      provider: input.provider,
      createdAt: new Date().toISOString()
    });

    if (db.extractions.length > 2000) {
      db.extractions = db.extractions.slice(-2000);
    }

    await writeDatabase(db);
  });
}

export async function countExtractionsForEmail(email: string) {
  const db = await readDatabase();
  const normalizedEmail = email.trim().toLowerCase();

  return db.extractions.filter((row) => row.email === normalizedEmail).length;
}
