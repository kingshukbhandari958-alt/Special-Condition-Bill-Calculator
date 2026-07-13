import type Decimal from "decimal.js";

export type CalculatorInputs = {
  A2: string;
  C2: string;
  A9: string;
  D9: string;
};

export type ValueType = "rate" | "quantity" | "money";

export type CalculatedCell = {
  cell: string;
  label: string;
  formula: string;
  substitutedFormula: string;
  rawValue: string;
  displayValue: string;
  valueType: ValueType;
};

export type CalculatorResults = {
  inputs: CalculatorInputs;
  cells: Record<string, CalculatedCell>;
  finalBeforeSpecialCondition: string;
  finalAfterSpecialCondition: string;
  errors: string[];
  warnings: string[];
};

export type DecimalValue = {
  decimal: Decimal;
  scale: number;
  raw: string;
};

export type FormulaDefinition = {
  cell: string;
  label: string;
  formula: string;
  valueType: ValueType;
  group: string;
};
