"use client";

import type { CSSProperties } from "react";
import type { CalculatedCell } from "@/types/calculator";

type FormulaTooltipProps = {
  cell: CalculatedCell;
  style?: CSSProperties;
};

export function FormulaTooltip({ cell, style }: FormulaTooltipProps) {
  return (
    <div
      role="tooltip"
      style={style}
      className="pointer-events-none z-[1000] hidden max-h-[calc(100vh-24px)] w-80 max-w-[calc(100vw-24px)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 text-left shadow-2xl md:block"
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
