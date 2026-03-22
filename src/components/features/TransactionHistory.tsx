import { useMemo, useState } from "react";
import { PresenceState, StatusFilter, TransactionRecord } from "@/lib/types";
import { formatCurrency, formatStamp, formatState } from "@/lib/utils";
import { Td, Th } from "../ui/Table";

type Props = {
  transactions: TransactionRecord[];
  isLoading: boolean;
  onMarkState: (recordId: string, state: PresenceState) => Promise<void>;
};

export function TransactionHistory({ transactions, isLoading, onMarkState }: Props) {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const filteredTransactions = useMemo(() => {
    const loweredSearch = searchText.trim().toLowerCase();

    return transactions.filter((entry) => {
      const matchesState = statusFilter === "all" ? true : entry.locationState === statusFilter;
      const searchable = [entry.collectedBy, entry.customerName, entry.passType, entry.generatedPassCode, entry.notes]
        .join(" ")
        .toLowerCase();
      const matchesSearch = loweredSearch ? searchable.includes(loweredSearch) : true;

      return matchesState && matchesSearch;
    });
  }, [searchText, statusFilter, transactions]);

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-soft backdrop-blur-xl sm:p-8 lg:p-9">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Activity</p>
          <h2 className="text-2xl font-bold text-slate-100">Transaction history</h2>
          <p className="mt-1 text-sm text-slate-400">Filter, search, and mark inside/outside from here.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-400">
          <span className="rounded-full bg-slate-950 px-3 py-1">Newest first</span>
          <span className="rounded-full bg-slate-950 px-3 py-1">Live feed</span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          className="field-input"
          placeholder="Search collector, customer, pass code"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          className="field-input"
        >
          <option value="all">All states</option>
          <option value="inside">Inside</option>
          <option value="outside">Outside</option>
          <option value="not-set">Not set</option>
        </select>
      </div>

      <div className="mt-6 space-y-3 md:hidden">
        {isLoading ? (
          <p className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-center text-slate-400">Loading records...</p>
        ) : filteredTransactions.length === 0 ? (
          <p className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-center text-slate-400">No records found.</p>
        ) : (
          filteredTransactions.map((record) => (
            <article key={record.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <button
                type="button"
                onClick={() => setExpandedRowId((current) => (current === record.id ? null : record.id))}
                className="flex w-full items-start justify-between gap-3 text-left"
              >
                <div className="space-y-1">
                  <p className="text-sm text-slate-300">{record.customerName}</p>
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Generated pass</p>
                  <p className="text-lg font-semibold text-emerald-300">{record.generatedPassCode}</p>
                  <p className="text-xs text-slate-400">{record.collectedBy}</p>
                </div>
                <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-emerald-300">{formatState(record.locationState)}</span>
              </button>
              {expandedRowId === record.id ? <RecordDetails record={record} onMarkState={onMarkState} /> : null}
            </article>
          ))
        )}
      </div>

      <div className="mt-6 hidden overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-950/70 md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
            <thead className="bg-slate-950 text-xs uppercase tracking-[0.18em] text-slate-400">
              <tr>
                <Th>Customer</Th>
                <Th>Generated pass</Th>
                <Th>Collected by</Th>
                <Th>Date</Th>
                <Th>Type</Th>
                <Th>Amount</Th>
                <Th>Passes</Th>
                <Th>State</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-14 text-center text-slate-400">Loading records...</td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-14 text-center text-slate-400">No records found.</td>
                </tr>
              ) : (
                filteredTransactions.map((record) => (
                  <tr key={record.id} className="align-top transition hover:bg-slate-900/40">
                    <Td>{record.customerName}</Td>
                    <Td className="font-mono text-xs text-emerald-300">{record.generatedPassCode}</Td>
                    <Td>{record.collectedBy}</Td>
                    <Td>{record.date} {record.time}</Td>
                    <Td>{record.passType}</Td>
                    <Td>{formatCurrency(record.amountCollected)}</Td>
                    <Td>{record.numberOfPasses}</Td>
                    <Td>{formatState(record.locationState)}</Td>
                    <Td>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onMarkState(record.id, "inside")}
                          className="rounded-full border border-emerald-700 px-3 py-1 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-950"
                        >
                          Inside
                        </button>
                        <button
                          type="button"
                          onClick={() => onMarkState(record.id, "outside")}
                          className="rounded-full border border-amber-700 px-3 py-1 text-xs font-semibold text-amber-300 transition hover:bg-amber-950"
                        >
                          Outside
                        </button>
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-slate-400">
                        <p>Inside at: {formatStamp(record.insideAt)}</p>
                        <p>Outside at: {formatStamp(record.outsideAt)}</p>
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function RecordDetails({
  record,
  onMarkState
}: {
  record: TransactionRecord;
  onMarkState: (recordId: string, state: PresenceState) => Promise<void>;
}) {
  return (
    <div className="mt-4 space-y-2 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-300">
      <p><span className="text-slate-500">Generated pass:</span> <span className="font-mono text-emerald-300">{record.generatedPassCode}</span></p>
      <p><span className="text-slate-500">Type:</span> {record.passType}</p>
      <p><span className="text-slate-500">Amount:</span> {formatCurrency(record.amountCollected)}</p>
      <p><span className="text-slate-500">Passes:</span> {record.numberOfPasses}</p>
      <p><span className="text-slate-500">Inside at:</span> {formatStamp(record.insideAt)}</p>
      <p><span className="text-slate-500">Outside at:</span> {formatStamp(record.outsideAt)}</p>
      <p><span className="text-slate-500">Notes:</span> {record.notes || "--"}</p>
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={() => onMarkState(record.id, "inside")}
          className="rounded-full border border-emerald-700 px-3 py-1 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-950"
        >
          Mark inside
        </button>
        <button
          type="button"
          onClick={() => onMarkState(record.id, "outside")}
          className="rounded-full border border-amber-700 px-3 py-1 text-xs font-semibold text-amber-300 transition hover:bg-amber-950"
        >
          Mark outside
        </button>
      </div>
    </div>
  );
}
