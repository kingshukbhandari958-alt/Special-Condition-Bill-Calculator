"use client";

import { useEffect, useMemo, useState } from "react";
import { FormulaInspector } from "@/components/calculator/FormulaInspector";
import { InputCard } from "@/components/calculator/InputCard";
import { MobileFormulaSheet } from "@/components/calculator/MobileFormulaSheet";
import { ResultSummary } from "@/components/calculator/ResultSummary";
import { SpreadsheetTable } from "@/components/calculator/SpreadsheetTable";
import { ValidationMessages } from "@/components/calculator/ValidationMessages";
import { CALCULATION_CONFIG, calculateFinancialSheet } from "@/lib/financialCalculator";
import { isAllowedInputCharacterSequence } from "@/lib/validation";
import type { CalculatedCell, CalculatorInputs } from "@/types/calculator";

const STORAGE_KEY = "special-condition-calculator:v1";
const SAMPLE_VALUES: CalculatorInputs = {
  A2: "7947.5781",
  C2: "10",
  A9: "29",
  D9: "23",
};

const EMPTY_VALUES: CalculatorInputs = {
  A2: "",
  C2: "",
  A9: "",
  D9: "",
};

function isRestorableInputs(value: unknown): value is CalculatorInputs {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const keys: Array<keyof CalculatorInputs> = ["A2", "C2", "A9", "D9"];
  return keys.every((key) => {
    const item = candidate[key];
    return typeof item === "string" && isAllowedInputCharacterSequence(item);
  });
}

export function CalculatorDashboard() {
  const [inputs, setInputs] = useState<CalculatorInputs>(() => {
    if (typeof window === "undefined") {
      return EMPTY_VALUES;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return EMPTY_VALUES;
      }
      const parsed: unknown = JSON.parse(raw);
      return isRestorableInputs(parsed) ? parsed : EMPTY_VALUES;
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      return EMPTY_VALUES;
    }
  });
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [mobileSheetCell, setMobileSheetCell] = useState<CalculatedCell | null>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  }, [inputs]);

  const results = useMemo(() => calculateFinancialSheet(inputs), [inputs]);
  const hasBlockingErrors = results.errors.length > 0;

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-3 py-5 sm:px-5 sm:py-8 lg:px-8">
      <header className="glass-card animate-enter rounded-2xl border border-white/40 p-5 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Financial Dashboard</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Special Condition Bill Calculator
            </h1>
            <p className="mt-2 text-sm text-slate-700">
              Exact decimal calculation without floating-point approximation
            </p>
          </div>

          <div className="space-y-2">
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              Exact Decimal Mode
            </span>
            <p className="text-xs text-slate-600">
              Policy: {CALCULATION_CONFIG.ROUNDING_STAGE} • {CALCULATION_CONFIG.MONEY_DECIMAL_PLACES} decimals • ROUND_HALF_UP
            </p>
          </div>
        </div>
      </header>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Input section</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="h-12 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              onClick={() => {
                setInputs(SAMPLE_VALUES);
              }}
            >
              Load sample values
            </button>
            <button
              type="button"
              className="h-12 rounded-xl border border-rose-300 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
              onClick={() => {
                setInputs(EMPTY_VALUES);
                window.localStorage.removeItem(STORAGE_KEY);
              }}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <InputCard
            cellId="A2"
            label="Rate"
            description="Base rate used by all amount calculations"
            value={inputs.A2}
            onChange={(next) => setInputs((current) => ({ ...current, A2: next }))}
          />
          <InputCard
            cellId="C2"
            label="Original Quantity"
            description="Original quantity from agreement"
            value={inputs.C2}
            onChange={(next) => setInputs((current) => ({ ...current, C2: next }))}
          />
          <InputCard
            cellId="A9"
            label="Current Agreement Quantity"
            description="Current bill quantity under agreement"
            value={inputs.A9}
            onChange={(next) => setInputs((current) => ({ ...current, A9: next }))}
          />
          <InputCard
            cellId="D9"
            label="Previous Bill Paid Quantity"
            description="Quantity already paid in previous bill"
            value={inputs.D9}
            onChange={(next) => setInputs((current) => ({ ...current, D9: next }))}
          />
        </div>
      </section>

      <ValidationMessages errors={results.errors} warnings={results.warnings} />

      <ResultSummary
        beforeRaw={results.finalBeforeSpecialCondition}
        afterRaw={results.finalAfterSpecialCondition}
        hasBlockingErrors={hasBlockingErrors}
      />

      <section className="sticky top-2 z-20 flex justify-end">
        <FormulaInspector
          open={inspectorOpen}
          onToggle={() => setInspectorOpen((current) => !current)}
          onClose={() => setInspectorOpen(false)}
          cells={results.cells}
        />
      </section>

      <SpreadsheetTable cells={results.cells} inputs={inputs} onOpenMobileSheet={setMobileSheetCell} />

      <MobileFormulaSheet
        open={mobileSheetCell !== null}
        cell={mobileSheetCell}
        onClose={() => setMobileSheetCell(null)}
      />
    </main>
  );
}
