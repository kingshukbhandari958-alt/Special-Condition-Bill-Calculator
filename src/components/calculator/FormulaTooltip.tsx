"use client";

import type { CalculatedCell } from "@/types/calculator";

type FormulaTooltipProps = {
  cell: CalculatedCell;
};

export function FormulaTooltip({ cell }: FormulaTooltipProps) {
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute right-0 z-30 mt-2 hidden w-80 max-w-[90vw] rounded-xl border border-slate-200 bg-white p-3 text-left shadow-2xl md:block"
    >
      <p className="text-xs font-semibold text-slate-500">{cell.cell}</p>
      <p className="text-sm font-semibold text-slate-900">{cell.label}</p>
      <div className="mt-2 space-y-2 text-xs text-slate-700">
        <div>
          <p className="font-semibold">Formula</p>
          <p>{cell.formula}</p>
        </div>
        <div>
          <p className="font-semibold">Current calculation</p>
          <p>{cell.substitutedFormula}</p>
        </div>
        <div>
          <p className="font-semibold">Exact result</p>
          <p>{cell.rawValue}</p>
        </div>
        <div>
          <p className="font-semibold">Displayed</p>
          <p>{cell.displayValue}</p>
        </div>
        {cell.valueType === "money" ? (
          <p className="text-[11px] text-slate-500">Rounding: Final display only, 2 decimals, ROUND_HALF_UP.</p>
        ) : null}
      </div>
    </div>
  );
}
