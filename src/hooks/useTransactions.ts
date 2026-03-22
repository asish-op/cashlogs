import { useState, useEffect, useMemo } from 'react';
import { subscribeTransactions, addTransaction, setPresence, clearTransactions } from '@/lib/firebaseTransactions';
import { TransactionRecord, PresenceState } from '@/lib/types';

export function useTransactions() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeTransactions(
      (records) => {
        setTransactions(records);
        setIsLoading(false);
      },
      (message) => {
        setError(message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const totals = useMemo(() => {
    return transactions.reduce(
      (accumulator, entry) => {
        accumulator.amount += entry.amountCollected;
        accumulator.passes += entry.numberOfPasses;
        accumulator.inside += entry.locationState === "inside" ? 1 : 0;
        accumulator.outside += entry.locationState === "outside" ? 1 : 0;
        return accumulator;
      },
      { amount: 0, passes: 0, inside: 0, outside: 0 }
    );
  }, [transactions]);

  const handleAddTransaction = async (record: Omit<TransactionRecord, 'id'>) => {
    setError(null);
    try {
      await addTransaction(record);
    } catch {
      setError("Unable to save the transaction.");
      throw new Error("Unable to save the transaction.");
    }
  };

  const handleMarkState = async (recordId: string, state: PresenceState) => {
    setError(null);
    try {
      await setPresence(recordId, state);
    } catch {
      setError("Failed to update inside or outside time.");
      throw new Error("Failed to update inside or outside time.");
    }
  };

  const handleClear = async () => {
    setError(null);
    try {
      await clearTransactions();
    } catch {
      setError("Unable to clear records.");
      throw new Error("Unable to clear records.");
    }
  };

  return {
    transactions,
    isLoading,
    error,
    totals,
    setError,
    addTransaction: handleAddTransaction,
    markState: handleMarkState,
    clearTransactions: handleClear
  };
}