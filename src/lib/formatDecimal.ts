import Decimal from "decimal.js";

export const DEFAULT_CURRENCY_SYMBOL = "₹";
export const MONEY_DECIMAL_PLACES = 2;

const DECIMAL_DIGIT_REGEX = /^-?(?:\d+\.\d+|\d+|\.\d+)$/;

function normalizeDecimalString(decimalString: string): string {
  const value = decimalString.trim();
  if (!DECIMAL_DIGIT_REGEX.test(value)) {
    throw new Error(`Invalid decimal string: ${decimalString}`);
  }
  return value;
}

export function addThousandsSeparators(value: string): string {
  const normalized = value.trim();
  const negative = normalized.startsWith("-");
  const unsigned = negative ? normalized.slice(1) : normalized;
  const [integerPart, fractionalPart] = unsigned.split(".");

  const withSeparators = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const rebuilt = fractionalPart === undefined ? withSeparators : `${withSeparators}.${fractionalPart}`;

  return negative ? `-${rebuilt}` : rebuilt;
}

export function formatMoney(decimalString: string): string {
  const normalized = normalizeDecimalString(decimalString);
  const rounded = new Decimal(normalized)
    .toDecimalPlaces(MONEY_DECIMAL_PLACES, Decimal.ROUND_HALF_UP)
    .toFixed(MONEY_DECIMAL_PLACES);

  return `${DEFAULT_CURRENCY_SYMBOL}${addThousandsSeparators(rounded)}`;
}

export function formatRate(decimalString: string): string {
  const normalized = normalizeDecimalString(decimalString);
  const decimal = new Decimal(normalized);
  const fixed = decimal.toFixed(decimal.decimalPlaces());
  return addThousandsSeparators(fixed);
}

export function formatQuantity(decimalString: string): string {
  const normalized = normalizeDecimalString(decimalString);
  const decimal = new Decimal(normalized);
  const fixed = decimal.toFixed(decimal.decimalPlaces());
  return addThousandsSeparators(fixed);
}
