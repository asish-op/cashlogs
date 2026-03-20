import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { TransactionRecord } from "@/lib/types";

const DATA_DIRECTORY = join(process.cwd(), "data");
const TRANSACTIONS_FILE = join(DATA_DIRECTORY, "transactions.json");

let writeQueue: Promise<void> = Promise.resolve();

async function ensureFile() {
  await mkdir(DATA_DIRECTORY, { recursive: true });

  try {
    await readFile(TRANSACTIONS_FILE, "utf8");
  } catch {
    await writeFile(TRANSACTIONS_FILE, "[]", "utf8");
  }
}

async function readTransactions(): Promise<TransactionRecord[]> {
  await ensureFile();
  const raw = await readFile(TRANSACTIONS_FILE, "utf8");

  try {
    const parsed = JSON.parse(raw) as TransactionRecord[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

async function writeTransactions(records: TransactionRecord[]) {
  await ensureFile();
  await writeFile(TRANSACTIONS_FILE, JSON.stringify(records, null, 2), "utf8");
}

function queueWrite(work: () => Promise<void>) {
  writeQueue = writeQueue.then(work, work);
  return writeQueue;
}

function sortByNewest(records: TransactionRecord[]) {
  return records.sort((a, b) => b.createdAt - a.createdAt);
}

export async function listTransactions(): Promise<TransactionRecord[]> {
  const records = await readTransactions();
  return sortByNewest(records);
}

export async function insertTransaction(record: TransactionRecord): Promise<void> {
  await queueWrite(async () => {
    const records = await readTransactions();
    records.push(record);
    await writeTransactions(sortByNewest(records));
  });
}

export async function clearTransactions(): Promise<void> {
  await queueWrite(async () => {
    await writeTransactions([]);
  });
}