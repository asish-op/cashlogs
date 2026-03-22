import React from "react";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="sm:col-span-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{children}</div>;
}
