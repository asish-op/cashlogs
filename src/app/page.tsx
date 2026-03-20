"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { TransactionRecord } from "@/lib/types";

type FormState = {
  collectedBy: string;
  date: string;
  time: string;
  passType: string;
  amountCollected: string;
  numberOfPasses: string;
  generatedPassCode: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

function getInitialFormState(): FormState {
  const now = new Date();

  return {
    collectedBy: "",
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 5),
    passType: "Single Pass",
    amountCollected: "",
    numberOfPasses: "1",
    generatedPassCode: ""
  };
}

export default function Home() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [form, setForm] = useState<FormState>(() => getInitialFormState());
  const [isLoading, setIsLoading] = useState(true);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/transactions", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to fetch transactions.");
        }

        const records = (await response.json()) as TransactionRecord[];
        setTransactions(records);
      } catch {
        setSaveError("Unable to load shared transactions.");
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, []);

  const totals = useMemo(() => {
    return transactions.reduce(
      (accumulator, entry) => {
        accumulator.amount += entry.amountCollected;
        accumulator.passes += entry.numberOfPasses;
        return accumulator;
      },
      { amount: 0, passes: 0 }
    );
  }, [transactions]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveError("");

    const amountCollected = Number(form.amountCollected);
    const numberOfPasses = Number(form.numberOfPasses);

    if (!form.collectedBy.trim() || !form.date || !form.time || !form.passType.trim() || !form.generatedPassCode.trim()) {
      return;
    }

    if (!Number.isFinite(amountCollected) || amountCollected <= 0 || !Number.isInteger(numberOfPasses) || numberOfPasses <= 0) {
      return;
    }

    const newEntry: TransactionRecord = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      collectedBy: form.collectedBy.trim(),
      date: form.date,
      time: form.time,
      passType: form.passType.trim(),
      amountCollected,
      numberOfPasses,
      generatedPassCode: form.generatedPassCode.trim()
    };

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newEntry)
      });

      if (!response.ok) {
        throw new Error("Failed to save transaction.");
      }

      setTransactions((current) => [newEntry, ...current]);
      setForm((current) => ({
        ...current,
        collectedBy: "",
        amountCollected: "",
        numberOfPasses: "1",
        generatedPassCode: ""
      }));
    } catch {
      setSaveError("Unable to save the transaction to shared database.");
    }
  }

  async function handleClear() {
    const response = await fetch("/api/transactions", { method: "DELETE" });
    if (!response.ok) {
      setSaveError("Unable to clear shared transactions.");
      return;
    }

    setTransactions([]);
  }

  return (
    <main className="min-h-screen px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-6 shadow-soft backdrop-blur-xl lg:p-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard label="Entries" value={transactions.length.toString()} />
            <MetricCard label="Total amount" value={formatCurrency(totals.amount)} />
            <MetricCard label="Total passes" value={totals.passes.toString()} />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <form onSubmit={handleSubmit} className="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-6 shadow-soft backdrop-blur-xl lg:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-100">Add transaction</h2>
                <p className="mt-1 text-sm text-slate-400">All fields are required. Pass code is entered manually.</p>
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
              >
                Clear log
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Collected by">
                <input
                  value={form.collectedBy}
                  onChange={(event) => setForm((current) => ({ ...current, collectedBy: event.target.value }))}
                  className="field-input"
                  placeholder="Enter name"
                />
              </Field>

              <Field label="Date">
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                  className="field-input"
                />
              </Field>

              <Field label="Time">
                <input
                  type="time"
                  value={form.time}
                  onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
                  className="field-input"
                />
              </Field>

              <Field label="Type of pass">
                <input
                  value={form.passType}
                  onChange={(event) => setForm((current) => ({ ...current, passType: event.target.value }))}
                  className="field-input"
                  placeholder="Single Pass"
                />
              </Field>

              <Field label="Amount collected">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amountCollected}
                  onChange={(event) => setForm((current) => ({ ...current, amountCollected: event.target.value }))}
                  className="field-input"
                  placeholder="0.00"
                />
              </Field>

              <Field label="Number of passes">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.numberOfPasses}
                  onChange={(event) => setForm((current) => ({ ...current, numberOfPasses: event.target.value }))}
                  className="field-input"
                />
              </Field>

              <Field label="Generated pass code">
                <input
                  value={form.generatedPassCode}
                  onChange={(event) => setForm((current) => ({ ...current, generatedPassCode: event.target.value }))}
                  className="field-input"
                  placeholder="Enter generated pass"
                />
              </Field>
            </div>

            {saveError ? <p className="mt-4 text-sm text-rose-400">{saveError}</p> : null}

            <button
              type="submit"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
            >
              Save transaction
            </button>
          </form>

          <section className="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-6 shadow-soft backdrop-blur-xl lg:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-100">Transaction history</h2>
                <p className="mt-1 text-sm text-slate-400">Recent entries appear first.</p>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                {transactions.length} records
              </span>
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-800 bg-slate-900/70">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                  <thead className="bg-slate-900 text-xs uppercase tracking-[0.18em] text-slate-400">
                    <tr>
                      <Th>Collected by</Th>
                      <Th>Date</Th>
                      <Th>Time</Th>
                      <Th>Type of pass</Th>
                      <Th>Amount collected</Th>
                      <Th>Number of passes</Th>
                      <Th>Generated pass code</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-16 text-center text-slate-400">
                          Loading shared database records...
                        </td>
                      </tr>
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-16 text-center text-slate-400">
                          No transactions yet. Add the first cash entry using the form.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((transaction) => (
                        <tr key={transaction.id} className="align-top hover:bg-slate-800/40">
                          <Td>{transaction.collectedBy}</Td>
                          <Td>{transaction.date}</Td>
                          <Td>{transaction.time}</Td>
                          <Td>{transaction.passType}</Td>
                          <Td>{formatCurrency(transaction.amountCollected)}</Td>
                          <Td>{transaction.numberOfPasses}</Td>
                          <Td className="font-mono text-xs text-emerald-300">{transaction.generatedPassCode}</Td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-800 bg-slate-900 p-4 shadow-lg shadow-black/25">
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight text-slate-100">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2 text-sm font-semibold text-slate-300">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-semibold whitespace-nowrap">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-4 whitespace-nowrap text-slate-200 ${className}`}>{children}</td>;
}
