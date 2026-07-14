import Decimal from "decimal.js";
import {
  DEFAULT_CURRENCY_SYMBOL,
  formatMoney,
  formatQuantity,
  formatRate,
} from "@/lib/formatDecimal";
import { FORMULA_BY_CELL } from "@/lib/formulaDefinitions";
import { getDecimalScale, validateInputStrings } from "@/lib/validation";
import type { CalculatedCell, CalculatorInputs, CalculatorResults, DecimalValue } from "@/types/calculator";

export const DECIMAL_PRECISION = 40;
export const MONEY_DECIMAL_PLACES = 2;
export const ROUNDING_MODE = Decimal.ROUND_HALF_UP;
export const ROUNDING_STAGE = "FINAL_ONLY" as const;

Decimal.set({
  precision: DECIMAL_PRECISION,
  rounding: ROUNDING_MODE,
  toExpNeg: -100,
  toExpPos: 100,
});

const RATE_98: DecimalValue = {
  decimal: new Decimal("0.98"),
  scale: 2,
  raw: "0.98",
};

const RATE_96: DecimalValue = {
  decimal: new Decimal("0.96"),
  scale: 2,
  raw: "0.96",
};

const RATE_125: DecimalValue = {
  decimal: new Decimal("1.25"),
  scale: 2,
  raw: "1.25",
};

const RATE_15: DecimalValue = {
  decimal: new Decimal("0.15"),
  scale: 2,
  raw: "0.15",
};

function decimalToRaw(decimal: Decimal, scale: number): string {
  const fixed = decimal.toFixed(scale);
  if (new Decimal(fixed).isZero()) {
    return scale === 0 ? "0" : new Decimal("0").toFixed(scale);
  }
  return fixed;
}

function makeDecimalValue(value: string): DecimalValue {
  const raw = value.trim();
  return {
    decimal: new Decimal(raw),
    scale: getDecimalScale(raw),
    raw,
  };
}

function addValues(left: DecimalValue, right: DecimalValue): DecimalValue {
  const scale = left.scale >= right.scale ? left.scale : right.scale;
  const decimal = left.decimal.plus(right.decimal);
  return {
    decimal,
    scale,
    raw: decimalToRaw(decimal, scale),
  };
}

function subtractValues(left: DecimalValue, right: DecimalValue): DecimalValue {
  const scale = left.scale >= right.scale ? left.scale : right.scale;
  const decimal = left.decimal.minus(right.decimal);
  return {
    decimal,
    scale,
    raw: decimalToRaw(decimal, scale),
  };
}

function multiplyValues(left: DecimalValue, right: DecimalValue): DecimalValue {
  const scale = left.scale + right.scale;
  const decimal = left.decimal.times(right.decimal);
  return {
    decimal,
    scale,
    raw: decimalToRaw(decimal, scale),
  };
}

function cloneValue(value: DecimalValue): DecimalValue {
  return {
    decimal: value.decimal,
    scale: value.scale,
    raw: value.raw,
  };
}

function zeroValue(scale: number): DecimalValue {
  const decimal = new Decimal(0);
  return {
    decimal,
    scale,
    raw: decimalToRaw(decimal, scale),
  };
}

function floorAtZero(value: DecimalValue): DecimalValue {
  return value.decimal.isNegative() ? zeroValue(value.scale) : value;
}

function makeCell(
  cell: string,
  value: DecimalValue,
  substitutedFormula: string,
): CalculatedCell {
  const definition = FORMULA_BY_CELL[cell];
  const formatter =
    definition.valueType === "money"
      ? formatMoney
      : definition.valueType === "rate"
        ? formatRate
        : formatQuantity;

  return {
    cell,
    label: definition.label,
    formula: definition.formula,
    substitutedFormula,
    rawValue: value.raw,
    displayValue: formatter(value.raw),
    valueType: definition.valueType,
  };
}

export function calculateFinancialSheet(inputs: CalculatorInputs): CalculatorResults {
  const normalizedInputs: CalculatorInputs = {
    A2: inputs.A2,
    C2: inputs.C2,
    A9: inputs.A9,
    D9: inputs.D9,
  };

  const inputErrors = validateInputStrings(normalizedInputs);
  if (inputErrors.length > 0) {
    return {
      inputs: normalizedInputs,
      cells: {},
      finalBeforeSpecialCondition: "",
      finalAfterSpecialCondition: "",
      errors: inputErrors,
      warnings: [],
    };
  }

  const A2 = makeDecimalValue(normalizedInputs.A2);
  const C2 = makeDecimalValue(normalizedInputs.C2);
  const A9 = makeDecimalValue(normalizedInputs.A9);
  const D9 = makeDecimalValue(normalizedInputs.D9);

  const B2 = cloneValue(A2);
  const B3 = multiplyValues(A2, RATE_98);
  const B4 = multiplyValues(A2, RATE_96);

  const D2 = multiplyValues(C2, RATE_125);
  const D3 = multiplyValues(C2, RATE_15);
  const D4 = subtractValues(A9, addValues(D2, D3));

  const E2 = cloneValue(D2);
  const E3 = cloneValue(D3);
  const E4 = subtractValues(A9, addValues(E2, E3));

  const F2 = multiplyValues(E2, B2);
  const F3 = multiplyValues(E3, B3);
  const F4 = multiplyValues(E4, B4);
  const F5 = addValues(addValues(F2, F3), F4);

  const I2 = multiplyValues(A2, A9);
  const J2 = cloneValue(F5);

  const previousTierLimit = addValues(D2, D3);
  const E9 = D9.decimal.lessThan(D2.decimal) ? cloneValue(D9) : cloneValue(E2);
  const E10Base = D9.decimal.lessThan(previousTierLimit.decimal)
    ? subtractValues(D9, D2)
    : cloneValue(E3);
  const E10 = floorAtZero(E10Base);
  const E11 = floorAtZero(subtractValues(D9, addValues(E9, E10)));

  const F9 = multiplyValues(E9, B2);
  const F10 = multiplyValues(E10, B3);
  const F11 = multiplyValues(E11, B4);
  const F12 = addValues(addValues(F9, F10), F11);

  const C16 = subtractValues(I2, multiplyValues(D9, A2));
  const D16 = subtractValues(J2, F12);

  const cells: Record<string, CalculatedCell> = {
    B2: makeCell("B2", B2, `B2 = ${A2.raw}`),
    B3: makeCell("B3", B3, `B3 = ${A2.raw} × 0.98`),
    B4: makeCell("B4", B4, `B4 = ${A2.raw} × 0.96`),
    D2: makeCell("D2", D2, `D2 = ${C2.raw} × 1.25`),
    D3: makeCell("D3", D3, `D3 = ${C2.raw} × 0.15`),
    D4: makeCell("D4", D4, `D4 = ${A9.raw} - (${D2.raw} + ${D3.raw})`),
    E2: makeCell("E2", E2, `E2 = ${D2.raw}`),
    E3: makeCell("E3", E3, `E3 = ${D3.raw}`),
    E4: makeCell("E4", E4, `E4 = ${A9.raw} - (${E2.raw} + ${E3.raw})`),
    F2: makeCell("F2", F2, `F2 = ${E2.raw} × ${B2.raw}`),
    F3: makeCell("F3", F3, `F3 = ${E3.raw} × ${B3.raw}`),
    F4: makeCell("F4", F4, `F4 = ${E4.raw} × ${B4.raw}`),
    F5: makeCell("F5", F5, `F5 = ${F2.raw} + ${F3.raw} + ${F4.raw}`),
    I2: makeCell("I2", I2, `I2 = ${A2.raw} × ${A9.raw}`),
    J2: makeCell("J2", J2, `J2 = ${F5.raw}`),
    E9: makeCell("E9", E9, `E9 = ${D9.raw} < ${D2.raw} ? ${D9.raw} : ${E2.raw}`),
    E10: makeCell(
      "E10",
      E10,
      `E10 = max(0, ${D9.raw} < ${previousTierLimit.raw} ? ${D9.raw} - ${D2.raw} : ${E3.raw})`,
    ),
    E11: makeCell("E11", E11, `E11 = max(0, ${D9.raw} - (${E9.raw} + ${E10.raw}))`),
    F9: makeCell("F9", F9, `F9 = ${E9.raw} × ${B2.raw}`),
    F10: makeCell("F10", F10, `F10 = ${E10.raw} × ${B3.raw}`),
    F11: makeCell("F11", F11, `F11 = ${E11.raw} × ${B4.raw}`),
    F12: makeCell("F12", F12, `F12 = ${F9.raw} + ${F10.raw} + ${F11.raw}`),
    C16: makeCell("C16", C16, `C16 = ${I2.raw} - (${D9.raw} × ${A2.raw})`),
    D16: makeCell("D16", D16, `D16 = ${J2.raw} - ${F12.raw}`),
  };

  const errors: string[] = [];
  if (D4.decimal.isNegative()) {
    errors.push(`Invalid formula D4 = A9 - (D2 + D3): result is negative (${D4.raw})`);
  }
  if (E4.decimal.isNegative()) {
    errors.push(`Invalid formula E4 = A9 - (E2 + E3): result is negative (${E4.raw})`);
  }
  const warnings: string[] = [];
  if (D9.decimal.greaterThan(A9.decimal)) {
    warnings.push("Warning: D9 is greater than A9");
  }

  return {
    inputs: normalizedInputs,
    cells,
    finalBeforeSpecialCondition: C16.raw,
    finalAfterSpecialCondition: D16.raw,
    errors,
    warnings,
  };
}

export const CALCULATION_CONFIG = {
  DECIMAL_PRECISION,
  MONEY_DECIMAL_PLACES,
  ROUNDING_MODE,
  ROUNDING_STAGE,
  DEFAULT_CURRENCY_SYMBOL,
} as const;
