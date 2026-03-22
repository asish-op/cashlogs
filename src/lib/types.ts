export type PresenceState = "inside" | "outside" | "not-set";

export type StatusFilter = "all" | "inside" | "outside";

export interface FormState {
  collectedBy: string;
  customerName: string;
  date: string;
  time: string;
  passType: string;
  amountCollected: string;
  numberOfPasses: string;
  generatedPassCode: string;
  notes: string;
}

export type TransactionRecord = {
  id: string;
  createdAt: number;
  updatedAt: number;
  collectedBy: string;
  customerName: string;
  date: string;
  time: string;
  passType: string;
  amountCollected: number;
  numberOfPasses: number;
  generatedPassCode: string;
  notes: string;
  locationState: PresenceState;
  insideAt: number | null;
  outsideAt: number | null;
};