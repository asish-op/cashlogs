import { FormState, PresenceState } from "./types";

export function getInitialFormState(): FormState {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const timeStr = `${hh}:${min}`;

  return {
    collectedBy: "",
    customerName: "",
    date: dateStr,
    time: timeStr,
    passType: "",
    amountCollected: "",
    numberOfPasses: "1",
    generatedPassCode: "",
    notes: ""
  };
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function formatStamp(timestamp: number | null) {
  if (!timestamp) return "--";
  return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatState(state: PresenceState) {
  if (state === "inside") return "Inside";
  if (state === "outside") return "Outside";
  return "Not set";
}
