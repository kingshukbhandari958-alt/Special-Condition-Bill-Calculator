import Decimal from "decimal.js";
import type { CalculatorInputs } from "@/types/calculator";

const PARTIAL_DECIMAL_REGEX = /^-?(?:\d+)?(?:\.\d*)?$/;
const FULL_DECIMAL_REGEX = /^-?(?:\d+\.\d+|\d+|\.\d+)$/;

export function isAllowedInputCharacterSequence(value: string): boolean {
  return PARTIAL_DECIMAL_REGEX.test(value);
}

export function isValidDecimalString(value: string): boolean {
  if (!FULL_DECIMAL_REGEX.test(value.trim())) {
    return false;
  }

  try {
    const decimal = new Decimal(value.trim());
    return decimal.isFinite();
  } catch {
    return false;
  }
}

export function validateInputStrings(inputs: CalculatorInputs): string[] {
  const errors: string[] = [];
  const entries = Object.entries(inputs) as Array<[keyof CalculatorInputs, string]>;

  const hasEmpty = entries.some(([, value]) => value.trim() === "");
  if (hasEmpty) {
    errors.push("Enter all four values");
    return errors;
  }

  for (const [cell, value] of entries) {
    if (!isValidDecimalString(value)) {
      errors.push(`${cell} must be a valid decimal value`);
      continue;
    }

    const decimal = new Decimal(value.trim());
    if (decimal.isNegative()) {
      errors.push(`${cell} must be greater than or equal to zero`);
    }
  }

  return errors;
}

export function getDecimalScale(value: string): number {
  const trimmed = value.trim();
  const [_, fraction = ""] = trimmed.split(".");
  return fraction.length;
}
