"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import * as XLSX from "xlsx-js-style";
import { FormulaTooltip } from "@/components/calculator/FormulaTooltip";
import type { CalculatedCell, CalculatorInputs } from "@/types/calculator";

type SpreadsheetTableProps = {
  cells: Record<string, CalculatedCell>;
  inputs: CalculatorInputs;
  onOpenMobileSheet: (cell: CalculatedCell) => void;
};

type GridColumn = "A" | "B" | "C" | "D" | "E" | "F" | "I" | "J";

type WorkbookCell = XLSX.CellObject & {
  s?: XLSX.CellStyle;
};

type WorkbookSheet = XLSX.WorkSheet & Record<string, WorkbookCell>;

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

const workbookBorder: XLSX.CellStyle["border"] = {
  top: { style: "thin", color: { rgb: "606060" } },
  bottom: { style: "thin", color: { rgb: "606060" } },
  left: { style: "thin", color: { rgb: "606060" } },
  right: { style: "thin", color: { rgb: "606060" } },
};

const workbookValueStyle: XLSX.CellStyle = {
  alignment: { horizontal: "right", vertical: "center" },
  border: workbookBorder,
};

const workbookFormulaStyle: XLSX.CellStyle = {
  alignment: { horizontal: "right", vertical: "center" },
  border: workbookBorder,
};

const workbookTotalStyle: XLSX.CellStyle = {
  fill: { patternType: "solid", fgColor: { rgb: "E2E8F0" } },
  font: { bold: true, color: { rgb: "DC2626" } },
  alignment: { horizontal: "center", vertical: "center" },
  border: workbookBorder,
};

function workbookHeaderStyle(fillColor: string): XLSX.CellStyle {
  return {
    fill: { patternType: "solid", fgColor: { rgb: fillColor } },
    font: { bold: true, italic: true, color: { rgb: "111827" } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: workbookBorder,
  };
}

function toNumericValue(value: string): number | string {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : value;
}

function makeValueCell(value: string): WorkbookCell {
  const parsedValue = toNumericValue(value);
  return {
    t: typeof parsedValue === "number" ? "n" : "s",
    v: parsedValue,
    s: workbookValueStyle,
  };
}

function makeFormulaCell(formula: string, cell: CalculatedCell | undefined): WorkbookCell {
  return {
    t: "n",
    f: formula,
    v: cell ? Number(cell.rawValue) : undefined,
    s: workbookFormulaStyle,
  };
}

function setWorkbookCell(sheet: WorkbookSheet, address: string, cell: WorkbookCell): void {
  sheet[address] = cell;
}

function makeStyledWorkbook(cells: Record<string, CalculatedCell>, inputs: CalculatorInputs): XLSX.WorkBook {
  const sheet = XLSX.utils.aoa_to_sheet(
    Array.from({ length: 16 }, () => Array.from({ length: 10 }, () => "")),
  ) as WorkbookSheet;

  const headerCells: Array<[string, string, string]> = [
    ["A1", "Rate", "FFF200"],
    ["B1", "Rate with special condition", "FFF200"],
    ["C1", "Original qty", "E8B8B8"],
    ["D1", "Qty with special condition", "E8B8B8"],
    ["E1", "Qty with special condition in accordance with current agreement", "E8B8B8"],
    ["F1", "Total", "DCE8C8"],
    ["I1", "Total before special condition", "D8CCE6"],
    ["J1", "Total after special condition", "D8CCE6"],
    ["A8", "Current agreement quantity", "C8B6E2"],
    ["D8", "Previous bill paid quantity", "D9E4F3"],
    ["E8", "Previous bill paid quantity with special condition", "D9E4F3"],
    ["F8", "Previous bill amount with special condition", "D9E4F3"],
    ["C15", "Amount payable before special condition", "E8DFC4"],
    ["D15", "Amount payable after special condition", "E8DFC4"],
  ];

  for (const [address, value, fillColor] of headerCells) {
    setWorkbookCell(sheet, address, { t: "s", v: value, s: workbookHeaderStyle(fillColor) });
  }

  setWorkbookCell(sheet, "A2", makeValueCell(inputs.A2));
  setWorkbookCell(sheet, "B2", makeFormulaCell("A2", cells.B2));
  setWorkbookCell(sheet, "B3", makeFormulaCell("A2*98%", cells.B3));
  setWorkbookCell(sheet, "B4", makeFormulaCell("A2*96%", cells.B4));
  setWorkbookCell(sheet, "C2", makeValueCell(inputs.C2));
  setWorkbookCell(sheet, "D2", makeFormulaCell("C2*125%", cells.D2));
  setWorkbookCell(sheet, "D3", makeFormulaCell("C2*15%", cells.D3));
  setWorkbookCell(sheet, "D4", makeFormulaCell("A9-(D2+D3)", cells.D4));
  setWorkbookCell(sheet, "E2", makeFormulaCell("D2", cells.E2));
  setWorkbookCell(sheet, "E3", makeFormulaCell("D3", cells.E3));
  setWorkbookCell(sheet, "E4", makeFormulaCell("A9-(E2+E3)", cells.E4));
  setWorkbookCell(sheet, "F2", makeFormulaCell("E2*B2", cells.F2));
  setWorkbookCell(sheet, "F3", makeFormulaCell("E3*B3", cells.F3));
  setWorkbookCell(sheet, "F4", makeFormulaCell("E4*B4", cells.F4));
  setWorkbookCell(sheet, "F5", makeFormulaCell("F2+F3+F4", cells.F5));
  setWorkbookCell(sheet, "I2", makeFormulaCell("A2*A9", cells.I2));
  setWorkbookCell(sheet, "J2", makeFormulaCell("F5", cells.J2));
  setWorkbookCell(sheet, "A9", makeValueCell(inputs.A9));
  setWorkbookCell(sheet, "D9", makeValueCell(inputs.D9));
  setWorkbookCell(sheet, "E9", makeFormulaCell("E2", cells.E9));
  setWorkbookCell(sheet, "E10", makeFormulaCell("E3", cells.E10));
  setWorkbookCell(sheet, "E11", makeFormulaCell("D9-(E9+E10)", cells.E11));
  setWorkbookCell(sheet, "F9", makeFormulaCell("E9*B2", cells.F9));
  setWorkbookCell(sheet, "F10", makeFormulaCell("E10*B3", cells.F10));
  setWorkbookCell(sheet, "F11", makeFormulaCell("E11*B4", cells.F11));
  setWorkbookCell(sheet, "F12", makeFormulaCell("F9+F10+F11", cells.F12));
  setWorkbookCell(sheet, "G12", { t: "s", v: "TOTAL", s: workbookTotalStyle });
  setWorkbookCell(sheet, "C16", makeFormulaCell("I2-(D9*A2)", cells.C16));
  setWorkbookCell(sheet, "D16", makeFormulaCell("J2-F12", cells.D16));

  sheet["!cols"] = [
    { wch: 14 },
    { wch: 24 },
    { wch: 18 },
    { wch: 24 },
    { wch: 30 },
    { wch: 22 },
    { wch: 10 },
    { wch: 10 },
    { wch: 28 },
    { wch: 28 },
  ];
  sheet["!rows"] = [
    { hpt: 42 },
    {},
    {},
    {},
    {},
    { hpt: 28 },
    { hpt: 28 },
    { hpt: 48 },
    {},
    {},
    {},
    {},
    { hpt: 28 },
    { hpt: 28 },
    { hpt: 48 },
  ];

  const workbook = XLSX.utils.book_new();
  workbook.Props = {
    Title: "Special Condition Calculation",
    Subject: "Styled billing calculation workbook",
    CreatedDate: new Date(),
  };
  XLSX.utils.book_append_sheet(workbook, sheet, "Calculation");
  return workbook;
}

function downloadWorkbook(cells: Record<string, CalculatedCell>, inputs: CalculatorInputs): void {
  const workbook = makeStyledWorkbook(cells, inputs);
  XLSX.writeFile(workbook, "special-condition-calculation.xlsx", {
    bookType: "xlsx",
    compression: true,
  });
}

async function copyExactValue(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = value;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textArea);
    return copied;
  }
}

function InputValue({
  value,
  cell,
  copied,
  onCopy,
}: {
  value: string;
  cell: string;
  copied: boolean;
  onCopy: (value: string, cell: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onCopy(value, cell)}
      className="cell-flash w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-right text-sm font-medium text-slate-900 transition hover:border-sky-400 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
      aria-label={`Copy value for ${cell}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{cell}</p>
      <p className="mt-0.5 break-all">{copied ? "Copied" : value === "" ? "Empty" : value}</p>
    </button>
  );
}

function SectionColumnHeader({ children = null, className = "" }: { children?: ReactNode; className?: string }) {
  return (
    <td className={`border border-slate-300 px-2 py-2 text-center text-[11px] font-semibold leading-tight text-slate-800 ${className}`}>
      {children}
    </td>
  );
}

function CalculatedValue({
  cell,
  copied,
  onCopy,
  onOpenMobileSheet,
}: {
  cell: CalculatedCell | undefined;
  copied: boolean;
  onCopy: (value: string, cell: string) => void;
  onOpenMobileSheet: (cell: CalculatedCell) => void;
}) {
  if (!cell) {
    return <div className="rounded-md border border-slate-200 bg-slate-100 px-2 py-2 text-center text-xs text-slate-400">Empty</div>;
  }

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => {
          onCopy(cell.rawValue, cell.cell);
          onOpenMobileSheet(cell);
        }}
        className="cell-flash w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-right transition hover:border-sky-400 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        aria-label={`Copy exact result for ${cell.cell}`}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{cell.cell}</p>
        <p className="mt-0.5 break-all text-sm font-semibold text-slate-900">{copied ? "Copied" : cell.displayValue}</p>
      </button>
      <div className="hidden group-hover:block group-focus-within:block">
        <FormulaTooltip cell={cell} />
      </div>
    </div>
  );
}

export function SpreadsheetTable({ cells, inputs, onOpenMobileSheet }: SpreadsheetTableProps) {
  const [copiedCell, setCopiedCell] = useState<string | null>(null);
  const canDownload = useMemo(() => Object.keys(cells).length > 0, [cells]);

  const handleCopy = (value: string, cell: string) => {
    void copyExactValue(value).then((copied) => {
      if (!copied) {
        return;
      }

      setCopiedCell(cell);
      window.setTimeout(() => {
        setCopiedCell((currentCell) => (currentCell === cell ? null : currentCell));
      }, 1200);
    });
  };

  const inputCell = (cell: keyof CalculatorInputs) => (
    <InputValue cell={cell} value={inputs[cell]} onCopy={handleCopy} copied={copiedCell === cell} />
  );

  const calculatedCell = (cellId: string) => (
    <CalculatedValue
      cell={cells[cellId]}
      copied={copiedCell === cellId}
      onCopy={handleCopy}
      onOpenMobileSheet={onOpenMobileSheet}
    />
  );

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-lg backdrop-blur">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Calculation Spreadsheet</h2>
          <p className="text-sm text-slate-600">Spreadsheet-style layout with exact-cell mapping. Tap/click cells to copy exact values.</p>
        </div>
        <button
          type="button"
          onClick={() => downloadWorkbook(cells, inputs)}
          disabled={!canDownload}
          className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Download Excel
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
              <td className="border border-slate-300 p-1.5">{inputCell("A2")}</td>
              <td className="border border-slate-300 p-1.5">{calculatedCell("B2")}</td>
              <td className="border border-slate-300 p-1.5">{inputCell("C2")}</td>
              <td className="border border-slate-300 p-1.5">{calculatedCell("D2")}</td>
              <td className="border border-slate-300 p-1.5">{calculatedCell("E2")}</td>
              <td className="border border-slate-300 p-1.5">{calculatedCell("F2")}</td>
              <td className="border border-slate-300 p-1.5">{calculatedCell("I2")}</td>
              <td className="border border-slate-300 p-1.5">{calculatedCell("J2")}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5">{calculatedCell("B3")}</td>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5">{calculatedCell("D3")}</td>
              <td className="border border-slate-300 p-1.5">{calculatedCell("E3")}</td>
              <td className="border border-slate-300 p-1.5">{calculatedCell("F3")}</td>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
            </tr>
            <tr>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5">{calculatedCell("B4")}</td>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5">{calculatedCell("D4")}</td>
              <td className="border border-slate-300 p-1.5">{calculatedCell("E4")}</td>
              <td className="border border-slate-300 p-1.5">{calculatedCell("F4")}</td>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
            </tr>
            <tr>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5">{calculatedCell("F5")}</td>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
            </tr>

            <tr>
              <td colSpan={8} className="border border-slate-400 bg-slate-200 px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700">
                Previous bill distribution and amount mapping
              </td>
            </tr>
            <tr>
              <SectionColumnHeader className="bg-violet-100">Current agreement quantity</SectionColumnHeader>
              <SectionColumnHeader className="bg-slate-100" />
              <SectionColumnHeader className="bg-slate-100" />
              <SectionColumnHeader className="bg-sky-100">Previous bill paid quantity</SectionColumnHeader>
              <SectionColumnHeader className="bg-sky-100">Previous bill paid quantity with special condition</SectionColumnHeader>
              <SectionColumnHeader className="bg-sky-100">Previous bill amount with special condition</SectionColumnHeader>
              <SectionColumnHeader className="bg-slate-100" />
              <SectionColumnHeader className="bg-slate-100" />
            </tr>
            <tr>
              <td className="border border-slate-300 p-1.5">{inputCell("A9")}</td>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5">{inputCell("D9")}</td>
              <td className="border border-slate-300 p-1.5">{calculatedCell("E9")}</td>
              <td className="border border-slate-300 p-1.5">{calculatedCell("F9")}</td>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
            </tr>
            <tr>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5">{calculatedCell("E10")}</td>
              <td className="border border-slate-300 p-1.5">{calculatedCell("F10")}</td>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
            </tr>
            <tr>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5">{calculatedCell("E11")}</td>
              <td className="border border-slate-300 p-1.5">{calculatedCell("F11")}</td>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
            </tr>
            <tr>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5">{calculatedCell("F12")}</td>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
            </tr>

            <tr>
              <td colSpan={8} className="border border-slate-400 bg-slate-200 px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700">
                Final payable amounts
              </td>
            </tr>
            <tr>
              <SectionColumnHeader className="bg-slate-100" />
              <SectionColumnHeader className="bg-slate-100" />
              <SectionColumnHeader className="bg-amber-100">Amount payable before special condition</SectionColumnHeader>
              <SectionColumnHeader className="bg-amber-100">Amount payable after special condition</SectionColumnHeader>
              <SectionColumnHeader className="bg-slate-100" />
              <SectionColumnHeader className="bg-slate-100" />
              <SectionColumnHeader className="bg-slate-100" />
              <SectionColumnHeader className="bg-slate-100" />
            </tr>
            <tr>
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5 bg-slate-100" />
              <td className="border border-slate-300 p-1.5">{calculatedCell("C16")}</td>
              <td className="border border-slate-300 p-1.5">{calculatedCell("D16")}</td>
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
