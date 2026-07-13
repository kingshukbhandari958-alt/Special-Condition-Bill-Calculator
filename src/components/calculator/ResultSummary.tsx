"use client";

import Decimal from "decimal.js";
import { formatMoney } from "@/lib/formatDecimal";

type ResultSummaryProps = {
  beforeRaw: string;
  afterRaw: string;
  hasBlockingErrors: boolean;
};

export function ResultSummary({ beforeRaw, afterRaw, hasBlockingErrors }: ResultSummaryProps) {
  if (hasBlockingErrors || beforeRaw === "" || afterRaw === "") {
    return (
      <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-lg">
        <h2 className="text-lg font-semibold text-rose-900">Final result</h2>
        <p className="mt-2 text-sm text-rose-800">
          Payable totals are blocked until all validation errors are resolved.
        </p>
      </section>
    );
  }

  const differenceRaw = new Decimal(beforeRaw).minus(new Decimal(afterRaw)).toFixed(
    new Decimal(beforeRaw).decimalPlaces() >= new Decimal(afterRaw).decimalPlaces()
      ? new Decimal(beforeRaw).decimalPlaces()
      : new Decimal(afterRaw).decimalPlaces(),
  );

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 shadow-lg">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Final result section</h2>
        <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">D16 Highlight</span>
      </header>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">C16 • Before special condition</p>
          <p key={beforeRaw} className="value-fade mt-2 text-2xl font-semibold text-slate-900">
            {formatMoney(beforeRaw)}
          </p>
          <details className="mt-2 text-xs text-slate-600">
            <summary className="cursor-pointer">Exact raw value</summary>
            <p className="mt-1 break-all">{beforeRaw}</p>
          </details>
        </article>

        <article className="rounded-xl border border-emerald-300 bg-white p-3 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">D16 • After special condition</p>
          <p key={afterRaw} className="value-fade mt-2 text-3xl font-bold text-emerald-700">
            {formatMoney(afterRaw)}
          </p>
          <details className="mt-2 text-xs text-slate-600">
            <summary className="cursor-pointer">Exact raw value</summary>
            <p className="mt-1 break-all">{afterRaw}</p>
          </details>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Difference due to special condition</p>
          <p key={differenceRaw} className="value-fade mt-2 text-2xl font-semibold text-slate-900">
            {formatMoney(differenceRaw)}
          </p>
          <details className="mt-2 text-xs text-slate-600">
            <summary className="cursor-pointer">Exact raw value</summary>
            <p className="mt-1 break-all">{differenceRaw}</p>
          </details>
        </article>
      </div>
    </section>
  );
}
