"use client";

import { FormulaTooltip } from "@/components/calculator/FormulaTooltip";
import type { CalculatedCell } from "@/types/calculator";

type SpreadsheetCellProps = {
  cell: CalculatedCell;
  flash: boolean;
  onOpenMobileSheet: (cell: CalculatedCell) => void;
};

export function SpreadsheetCell({ cell, flash, onOpenMobileSheet }: SpreadsheetCellProps) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => onOpenMobileSheet(cell)}
        className={`w-full rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
          flash
            ? "cell-flash border-sky-300 bg-sky-50"
            : "border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-md"
        }`}
        aria-label={`Inspect formula for ${cell.cell}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{cell.cell}</p>
            <p className="text-sm font-medium text-slate-800">{cell.label}</p>
          </div>
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
              cell.valueType === "money"
                ? "bg-emerald-100 text-emerald-800"
                : cell.valueType === "rate"
                  ? "bg-indigo-100 text-indigo-800"
                  : "bg-cyan-100 text-cyan-800"
            }`}
          >
            {cell.valueType}
          </span>
        </div>
        <p className="mt-2 text-base font-semibold text-slate-950">{cell.displayValue}</p>
      </button>
      <div className="hidden group-hover:block group-focus-within:block">
        <FormulaTooltip cell={cell} />
      </div>
    </div>
  );
}
