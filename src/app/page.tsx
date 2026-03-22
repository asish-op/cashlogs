"use client";

import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/utils";
import { MetricCard } from "@/components/ui/MetricCard";
import { TransactionForm } from "@/components/features/TransactionForm";
import { TransactionHistory } from "@/components/features/TransactionHistory";

export default function Home() {
  const {
    transactions,
    isLoading,
    error,
    totals,
    setError,
    addTransaction,
    markState,
    clearTransactions
  } = useTransactions();

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50 sm:px-6 lg:px-10 lg:py-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900/80 to-slate-950 p-6 shadow-soft backdrop-blur-xl sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Cash logs · fresh UI</p>
              <h1 className="text-3xl font-black text-slate-50 sm:text-4xl">Front desk runway</h1>
              <p className="max-w-2xl text-sm text-slate-400">Fast entry on the left, live history on the right. Every save pushes instantly to all screens.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 font-semibold uppercase tracking-[0.16em] text-emerald-300">Live sync</span>
              <span className="rounded-full bg-slate-900 px-3 py-1 font-semibold text-slate-200">Built: 2026-03-22</span>
              <button
                type="button"
                onClick={clearTransactions}
                className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-emerald-500 hover:text-emerald-200"
              >
                Clear all
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Total records" value={transactions.length.toString()} />
            <MetricCard label="Total amount" value={formatCurrency(totals.amount)} />
            <MetricCard label="Total passes" value={totals.passes.toString()} />
            <MetricCard label="Inside / Outside" value={`${totals.inside} / ${totals.outside}`} />
          </div>
        </header>

        <div className="flex flex-col gap-12">
          <section>
            <TransactionForm 
              onSave={addTransaction}
              saveError={error}
              setSaveError={setError}
            />
          </section>

          <section>
            <TransactionHistory 
              transactions={transactions}
              isLoading={isLoading}
              onMarkState={markState}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
