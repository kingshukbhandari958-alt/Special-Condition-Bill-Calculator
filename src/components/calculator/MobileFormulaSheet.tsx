"use client";

import type { CalculatedCell } from "@/types/calculator";

type MobileFormulaSheetProps = {
  open: boolean;
  cell: CalculatedCell | null;
  onClose: () => void;
};

export function MobileFormulaSheet({ open, cell, onClose }: MobileFormulaSheetProps) {
  return (
    <div
      className={`fixed inset-0 z-50 md:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-slate-950/45 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
        aria-label="Close formula details"
      />
      <section
        role="dialog"
        aria-modal="true"
        className={`absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {cell ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">{cell.cell}</h2>
              <button
                type="button"
                onClick={onClose}
                className="h-11 min-w-11 rounded-xl border border-slate-300 px-3 text-sm font-medium text-slate-700"
              >
                Close
              </button>
            </div>
            <p className="text-sm font-medium text-slate-800">{cell.label}</p>
            <div className="space-y-2 text-sm text-slate-700">
              <p>
                <span className="font-semibold">Formula:</span> {cell.formula}
              </p>
              <p>
                <span className="font-semibold">Current calculation:</span> {cell.substitutedFormula}
              </p>
              <p>
                <span className="font-semibold">Exact result:</span> {cell.rawValue}
              </p>
              <p>
                <span className="font-semibold">Displayed:</span> {cell.displayValue}
              </p>
              {cell.valueType === "money" ? (
                <p className="text-xs text-slate-500">Rounding note: Final display only, 2 decimals, ROUND_HALF_UP.</p>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
