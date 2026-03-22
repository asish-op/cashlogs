import React from "react";

export function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block space-y-2 text-sm font-semibold text-slate-300 sm:col-span-1 ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}
