export type TransactionRecord = {
  id: string;
  createdAt: number;
  collectedBy: string;
  date: string;
  time: string;
  passType: string;
  amountCollected: number;
  numberOfPasses: number;
  generatedPassCode: string;
};