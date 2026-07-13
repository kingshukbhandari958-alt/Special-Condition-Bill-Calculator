"use client";

import { useMemo, useState } from "react";
import { FORMULA_DEFINITIONS } from "@/lib/formulaDefinitions";
import type { CalculatedCell } from "@/types/calculator";

type FormulaInspectorProps = {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  cells: Record<string, CalculatedCell>;
};

export function FormulaInspector({ open, onToggle, onClose, cells }: FormulaInspectorProps) {
  const [search, setSearch] = useState("");

  const items = useMemo(() => {
    const query = search.trim().toUpperCase();
    return FORMULA_DEFINITIONS.map((definition) => cells[definition.cell]).filter((item): item is CalculatedCell => {
      if (!item) {
        return false;
      }
      if (query === "") {
        return true;
      }
      return item.cell.includes(query) || item.label.toUpperCase().includes(query);
    });
  }, [cells, search]);

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className="h-12 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
      >
        View all formulas
      </button>

      <div className={`fixed inset-0 z-40 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
        <button
          type="button"
          className={`absolute inset-0 bg-slate-900/45 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
          onClick={onClose}
          aria-label="Close formula inspector"
        />

        <aside
          className={`absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl transition-transform duration-300 md:w-[46rem] ${
            open ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-y-0 md:translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Formula inspector"
        >
          <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 p-4 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Formula Inspector</h2>
              <button
                type="button"
                className="h-11 min-w-11 rounded-xl border border-slate-300 px-3 text-sm font-medium"
                onClick={onClose}
              >
                Close
              </button>
            </div>
            <input
              type="text"
              inputMode="search"
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder="Search cell ID (e.g., F5, F12, D16)"
              className="mt-3 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            />
          </div>

          <div className="space-y-3 p-4">
            {items.map((item) => (
              <article key={item.cell} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.cell}</p>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="mt-2 text-xs text-slate-700">{item.formula}</p>
                <p className="mt-1 text-xs text-slate-700">{item.substitutedFormula}</p>
                <p className="mt-2 text-xs text-slate-600">Exact: {item.rawValue}</p>
                <p className="text-sm font-medium text-slate-900">Displayed: {item.displayValue}</p>
              </article>
            ))}
            {items.length === 0 ? <p className="text-sm text-slate-600">No formulas match your search.</p> : null}
          </div>
        </aside>
      </div>
    </>
  );
}
