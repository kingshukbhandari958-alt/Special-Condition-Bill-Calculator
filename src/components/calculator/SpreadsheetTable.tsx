"use client";

import { useMemo } from "react";
import { FormulaTooltip } from "@/components/calculator/FormulaTooltip";
import { FORMULA_DEFINITIONS } from "@/lib/formulaDefinitions";
import type { CalculatedCell, CalculatorInputs } from "@/types/calculator";

type SpreadsheetTableProps = {
  cells: Record<string, CalculatedCell>;
  inputs: CalculatorInputs;
  onOpenMobileSheet: (cell: CalculatedCell) => void;
};

type GridColumn = "A" | "B" | "C" | "D" | "E" | "F" | "I" | "J";

const COLUMNS: GridColumn[] = ["A", "B", "C", "D", "E", "F", "I", "J"];

const COLUMN_TITLES: Record<GridColumn, string> = {
  A: "Rate",
  B: "Rate with special condition",
  C: "Original qty",
  D: "Qty with special condition",
  E: "Qty with special condition in accordance with current agreement",
  F: "Total",
  I: "Total before special condition",
  J: "Total after special condition",
};

const HEADER_THEME: Record<GridColumn, string> = {
  A: "bg-yellow-300",
  B: "bg-yellow-200",
  C: "bg-rose-200",
  D: "bg-rose-200",
  E: "bg-rose-100",
  F: "bg-emerald-100",
  I: "bg-violet-100",
  J: "bg-violet-200",
};

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes("\n") || value.includes('"')) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

function makeCsvContent(cells: Record<string, CalculatedCell>, inputs: CalculatorInputs): string {
  const lines: string[] = [];

  lines.push("Cell,Label,Formula,Substituted Formula,Raw Value,Displayed Value,Value Type");
  lines.push(
    ["A2", "Rate", "Input", "Input", inputs.A2, inputs.A2, "rate"]
      .map((item) => escapeCsv(item))
      .join(","),
  );
  lines.push(
    ["C2", "Original Quantity", "Input", "Input", inputs.C2, inputs.C2, "quantity"]
      .map((item) => escapeCsv(item))
      .join(","),
  );
  lines.push(
    ["A9", "Current Agreement Quantity", "Input", "Input", inputs.A9, inputs.A9, "quantity"]
      .map((item) => escapeCsv(item))
      .join(","),
  );
  lines.push(
    ["D9", "Previous Bill Paid Quantity", "Input", "Input", inputs.D9, inputs.D9, "quantity"]
      .map((item) => escapeCsv(item))
      .join(","),
  );

  for (const definition of FORMULA_DEFINITIONS) {
    const cell = cells[definition.cell];
    if (!cell) {
      continue;
    }

    lines.push(
      [
        cell.cell,
        cell.label,
        cell.formula,
        cell.substitutedFormula,
        cell.rawValue,
        cell.displayValue,
        cell.valueType,
      ]
        .map((item) => escapeCsv(item))
        .join(","),
    );
  }

  return `\uFEFF${lines.join("\n")}`;
}

function downloadCsv(cells: Record<string, CalculatedCell>, inputs: CalculatorInputs): void {
  const csv = makeCsvContent(cells, inputs);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "special-condition-calculation.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function InputValue({ value, cell }: { value: string; cell: string }) {
  return (
    <div className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-right text-sm font-medium text-slate-900">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{cell}</p>
      <p className="mt-0.5 break-all">{value === "" ? "—" : value}</p>
    </div>
  );
}

function CalculatedValue({
  cell,
  onOpenMobileSheet,
}: {
  cell: CalculatedCell | undefined;
  onOpenMobileSheet: (cell: CalculatedCell) => void;
}) {
  if (!cell) {
    return <div className="rounded-md border border-slate-200 bg-slate-100 px-2 py-2 text-center text-xs text-slate-400">—</div>;
  }

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => onOpenMobileSheet(cell)}
        className="cell-flash w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-right transition hover:border-sky-400 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        aria-label={`Inspect formula for ${cell.cell}`}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{cell.cell}</p>
        <p className="mt-0.5 break-all text-sm font-semibold text-slate-900">{cell.displayValue}</p>
      </button>
      <div className="hidden group-hover:block group-focus-within:block">
        <FormulaTooltip cell={cell} />
      </div>
    </div>
  );
}

export function SpreadsheetTable({ cells, inputs, onOpenMobileSheet }: SpreadsheetTableProps) {
  const csvRows = useMemo(() => makeCsvContent(cells, inputs), [cells, inputs]);

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-lg backdrop-blur">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Calculation Spreadsheet</h2>
          <p className="text-sm text-slate-600">Spreadsheet-style layout with exact-cell mapping. Tap/click calculated cells for formula details.</p>
        </div>
        <button
          type="button"
          onClick={() => downloadCsv(cells, inputs)}
          disabled={csvRows.length === 0}
          className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Download CSV
        </button>
      </header>

      <div className="overflow-x-auto rounded-xl border border-slate-300 bg-slate-50">
        <table className="min-w-[980px] w-full border-collapse text-left text-xs md:text-sm">
          <thead>
            <tr>
              {COLUMNS.map((column) => (
                <th key={column} className={`border border-slate-400 px-2 py-2 align-top text-slate-900 ${HEADER_THEME[column]}`}>
                  <p className="text-[11px] font-semibold text-slate-700">{column}</p>
                  <p className="leading-tight font-semibold">{COLUMN_TITLES[column]}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-300 p-1.5"><InputValue cell="A2" value={inputs.A2} /></td>
              <td className="border border-slate-300 p-1.5"><CalculatedValue cell={cells.B2} onOpenMobileSheet={onOpenMobileSheet} /></td>
              <td className="border border-slate-300 p-1.5"><InputValue cell="C2" value={inputs.C2} /></td>
              <td className="border border-slate-300 p-1.5"><CalculatedValue cell={cells.D2} onOpenMobileSheet={onOpenMobileSheet} /></td>
              <td className="border border-slate-300 p-1.5"><CalculatedValue cell={cells.E2} onOpenMobileSheet={onOpenMobileSheet} /></td>
              <td className="border border-slate-300 p-1.5"><CalculatedValue cell={cells.F2} onOpenMobileSheet={onOpenMobileSheet} /></td>
              <td className="border border-slate-300 p-1.5"><CalculatedValue cell={cells.I2} onOpenMobileSheet={onOpenMobileSheet} /></td>
              <td className="border border-slate-300 p-1.5"><CalculatedValue cell={cells.J2} onOpenMobileSheet={onOpenMobileSheet} /></td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5"><CalculatedValue cell={cells.B3} onOpenMobileSheet={onOpenMobileSheet} /></td>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5"><CalculatedValue cell={cells.D3} onOpenMobileSheet={onOpenMobileSheet} /></td>
              <td className="border border-slate-300 p-1.5"><CalculatedValue cell={cells.E3} onOpenMobileSheet={onOpenMobileSheet} /></td>
              <td className="border border-slate-300 p-1.5"><CalculatedValue cell={cells.F3} onOpenMobileSheet={onOpenMobileSheet} /></td>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
            </tr>
            <tr>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5"><CalculatedValue cell={cells.B4} onOpenMobileSheet={onOpenMobileSheet} /></td>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5"><CalculatedValue cell={cells.D4} onOpenMobileSheet={onOpenMobileSheet} /></td>
              <td className="border border-slate-300 p-1.5"><CalculatedValue cell={cells.E4} onOpenMobileSheet={onOpenMobileSheet} /></td>
              <td className="border border-slate-300 p-1.5"><CalculatedValue cell={cells.F4} onOpenMobileSheet={onOpenMobileSheet} /></td>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
            </tr>
            <tr>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5"><CalculatedValue cell={cells.F5} onOpenMobileSheet={onOpenMobileSheet} /></td>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
            </tr>

            <tr>
              <td colSpan={8} className="border border-slate-400 bg-slate-200 px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700">
                Previous bill distribution and amount mapping
              </td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-1.5"><InputValue cell="A9" value={inputs.A9} /></td>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5"><InputValue cell="D9" value={inputs.D9} /></td>
              <td className="border border-slate-300 p-1.5"><CalculatedValue cell={cells.E9} onOpenMobileSheet={onOpenMobileSheet} /></td>
              <td className="border border-slate-300 p-1.5"><CalculatedValue cell={cells.F9} onOpenMobileSheet={onOpenMobileSheet} /></td>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
            </tr>
            <tr>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5"><CalculatedValue cell={cells.E10} onOpenMobileSheet={onOpenMobileSheet} /></td>
              <td className="border border-slate-300 p-1.5"><CalculatedValue cell={cells.F10} onOpenMobileSheet={onOpenMobileSheet} /></td>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
            </tr>
            <tr>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5"><CalculatedValue cell={cells.E11} onOpenMobileSheet={onOpenMobileSheet} /></td>
              <td className="border border-slate-300 p-1.5"><CalculatedValue cell={cells.F11} onOpenMobileSheet={onOpenMobileSheet} /></td>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
            </tr>
            <tr>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5"><CalculatedValue cell={cells.F12} onOpenMobileSheet={onOpenMobileSheet} /></td>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
            </tr>

            <tr>
              <td colSpan={8} className="border border-slate-400 bg-slate-200 px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700">
                Final payable amounts
              </td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5"><CalculatedValue cell={cells.C16} onOpenMobileSheet={onOpenMobileSheet} /></td>
              <td className="border border-slate-300 p-1.5"><CalculatedValue cell={cells.D16} onOpenMobileSheet={onOpenMobileSheet} /></td>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
