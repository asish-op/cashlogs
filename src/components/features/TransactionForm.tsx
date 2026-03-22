import { FormEvent, useState } from "react";
import { FormState, TransactionRecord } from "@/lib/types";
import { formatCurrency, getInitialFormState } from "@/lib/utils";
import { Field } from "../ui/Field";
import { SectionLabel } from "../ui/SectionLabel";

type Props = {
  onSave: (record: Omit<TransactionRecord, "id">) => Promise<void>;
  saveError: string | null;
  setSaveError: (msg: string) => void;
};

export function TransactionForm({ onSave, saveError, setSaveError }: Props) {
  const [form, setForm] = useState<FormState>(() => getInitialFormState());

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveError("");

    const amountCollected = Number(form.amountCollected);
    const numberOfPasses = Number(form.numberOfPasses);

    if (
      !form.collectedBy.trim() ||
      !form.customerName.trim() ||
      !form.date ||
      !form.time ||
      !form.passType.trim() ||
      !form.generatedPassCode.trim()
    ) {
      setSaveError("Please complete all required fields.");
      return;
    }

    if (!Number.isFinite(amountCollected) || amountCollected <= 0 || !Number.isInteger(numberOfPasses) || numberOfPasses <= 0) {
      setSaveError("Amount and number of passes must be valid positive values.");
      return;
    }

    const now = Date.now();

    try {
      await onSave({
        createdAt: now,
        updatedAt: now,
        collectedBy: form.collectedBy.trim(),
        customerName: form.customerName.trim(),
        date: form.date,
        time: form.time,
        passType: form.passType.trim(),
        amountCollected,
        numberOfPasses,
        generatedPassCode: form.generatedPassCode.trim(),
        notes: form.notes.trim(),
        locationState: "not-set",
        insideAt: null,
        outsideAt: null
      });

      setForm((current) => ({
        ...current,
        customerName: "",
        amountCollected: "",
        numberOfPasses: "1",
        generatedPassCode: "",
        notes: ""
      }));
    } catch (e) {
      // Error is already handled/set in the hook
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_24rem] xl:items-start">
      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-soft backdrop-blur-xl sm:p-8 lg:p-9 xl:order-1">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">New transaction</p>
            <h2 className="text-2xl font-bold text-slate-100">Add entry</h2>
            <p className="mt-1 text-sm text-slate-400">Complete the form and hit save. Generated pass is shown in the preview.</p>
          </div>
          <div className="flex flex-col items-end text-right text-xs text-slate-400">
            <span>Today {new Date().toLocaleDateString()}</span>
            <span>Local {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2">
          <SectionLabel>Identity</SectionLabel>
          <Field label="Collected by">
            <input
              value={form.collectedBy}
              onChange={(event) => setForm((current) => ({ ...current, collectedBy: event.target.value }))}
              className="field-input"
              placeholder="Front desk name"
            />
          </Field>

          <Field label="Customer name">
            <input
              value={form.customerName}
              onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))}
              className="field-input"
              placeholder="Visitor"
            />
          </Field>

          <SectionLabel>Schedule</SectionLabel>
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

          <SectionLabel>Pass details</SectionLabel>
          <Field label="Type of pass">
            <input
              value={form.passType}
              onChange={(event) => setForm((current) => ({ ...current, passType: event.target.value }))}
              className="field-input"
              placeholder="Single Pass"
            />
          </Field>

          <Field label="Generated pass">
            <input
              value={form.generatedPassCode}
              onChange={(event) => setForm((current) => ({ ...current, generatedPassCode: event.target.value }))}
              className="field-input font-mono uppercase tracking-[0.08em]"
              placeholder="PASS-1234"
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

          <Field label="Notes" className="sm:col-span-2">
            <textarea
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              className="field-input min-h-28 resize-y"
              placeholder="Optional notes or instructions"
            />
          </Field>
        </div>

        {saveError ? <p className="mt-4 text-sm text-rose-400">{saveError}</p> : null}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex flex-1 items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 sm:flex-none sm:px-7"
          >
            Save transaction
          </button>
          <p className="text-xs text-slate-500">Firestore updates in real time.</p>
        </div>
      </form>
    </div>
  );
}
