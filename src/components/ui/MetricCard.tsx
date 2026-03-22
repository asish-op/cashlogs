import React from "react";

export function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-800 bg-slate-900 p-4 shadow-lg shadow-black/25">
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight text-slate-100">{value}</p>
    </div>
  );
}
