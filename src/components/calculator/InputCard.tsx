"use client";

import { isAllowedInputCharacterSequence } from "@/lib/validation";

type InputCardProps = {
  cellId: "A2" | "C2" | "A9" | "D9";
  label: string;
  description: string;
  value: string;
  onChange: (next: string) => void;
};

export function InputCard({ cellId, label, description, value, onChange }: InputCardProps) {
  return (
    <article className="glass-card animate-enter rounded-2xl border border-white/30 p-4 shadow-lg transition-transform hover:-translate-y-0.5 motion-reduce:transition-none">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{cellId}</p>
        <span className="rounded-full bg-slate-900 px-2 py-1 text-[10px] font-medium text-white">Editable</span>
      </div>
      <label htmlFor={`input-${cellId}`} className="block text-sm font-semibold text-slate-900">
        {label}
      </label>
      <p className="mt-1 text-xs text-slate-600">{description}</p>
      <input
        id={`input-${cellId}`}
        name={cellId}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onWheel={(event) => {
          event.currentTarget.blur();
        }}
        onChange={(event) => {
          const next = event.currentTarget.value;
          if (isAllowedInputCharacterSequence(next)) {
            onChange(next);
          }
        }}
        className="mt-3 h-12 w-full rounded-xl border border-slate-300 bg-white/80 px-3 text-base font-medium text-slate-900 outline-none ring-0 transition focus:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-300"
        placeholder="0.00"
        aria-describedby={`input-${cellId}-help`}
      />
      <p id={`input-${cellId}-help`} className="mt-2 text-xs text-slate-500">
        Enter decimal value as text. No automatic correction applied.
      </p>
    </article>
  );
}
