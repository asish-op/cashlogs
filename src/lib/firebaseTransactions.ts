import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  writeBatch,
  type Unsubscribe
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { PresenceState, TransactionRecord } from "@/lib/types";

const transactionsCollection = collection(firestore, "transactions");

function asNumber(value: unknown): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function toRecord(id: string, payload: Record<string, unknown>): TransactionRecord {
  return {
    id,
    createdAt: asNumber(payload.createdAt),
    updatedAt: asNumber(payload.updatedAt),
    collectedBy: String(payload.collectedBy ?? ""),
    customerName: String(payload.customerName ?? ""),
    date: String(payload.date ?? ""),
    time: String(payload.time ?? ""),
    passType: String(payload.passType ?? ""),
    amountCollected: asNumber(payload.amountCollected),
    numberOfPasses: asNumber(payload.numberOfPasses),
    generatedPassCode: String(payload.generatedPassCode ?? ""),
    notes: String(payload.notes ?? ""),
    locationState: (payload.locationState as PresenceState) ?? "not-set",
    insideAt: payload.insideAt === null || payload.insideAt === undefined ? null : asNumber(payload.insideAt),
    outsideAt: payload.outsideAt === null || payload.outsideAt === undefined ? null : asNumber(payload.outsideAt)
  };
}

export function subscribeTransactions(onData: (records: TransactionRecord[]) => void, onError: (message: string) => void): Unsubscribe {
  const transactionsQuery = query(transactionsCollection, orderBy("createdAt", "desc"));

  return onSnapshot(
    transactionsQuery,
    (snapshot) => {
      const records = snapshot.docs.map((entry) => toRecord(entry.id, entry.data() as Record<string, unknown>));
      onData(records);
    },
    () => {
      onError("Unable to load records.");
    }
  );
}

export async function addTransaction(record: Omit<TransactionRecord, "id">): Promise<void> {
  await addDoc(transactionsCollection, record);
}

export async function setPresence(recordId: string, state: PresenceState): Promise<void> {
  const now = Date.now();
  const payload: {
    updatedAt: number;
    locationState: PresenceState;
    insideAt?: number;
    outsideAt?: number;
  } = {
    updatedAt: now,
    locationState: state
  };

  if (state === "inside") {
    payload.insideAt = now;
  }

  if (state === "outside") {
    payload.outsideAt = now;
  }

  await updateDoc(doc(firestore, "transactions", recordId), payload);
}

export async function clearTransactions(): Promise<void> {
  const snapshot = await getDocs(transactionsCollection);
  const batch = writeBatch(firestore);
  snapshot.docs.forEach((entry) => batch.delete(entry.ref));
  await batch.commit();
}
