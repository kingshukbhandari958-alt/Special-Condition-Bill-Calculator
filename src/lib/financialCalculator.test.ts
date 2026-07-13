import { describe, expect, it } from "vitest";
import { calculateFinancialSheet } from "./financialCalculator";
import { formatMoney } from "./formatDecimal";
import type { CalculatorInputs } from "@/types/calculator";

const SAMPLE_INPUTS: CalculatorInputs = {
  A2: "7947.5781",
  C2: "10",
  A9: "29",
  D9: "23",
};

const EXPECTED_RAW: Record<string, string> = {
  B2: "7947.5781",
  B3: "7788.626538",
  B4: "7629.674976",
  D2: "12.50",
  D3: "1.50",
  D4: "15.00",
  E2: "12.50",
  E3: "1.50",
  E4: "15.00",
  F2: "99344.726250",
  F3: "11682.93980700",
  F4: "114445.12464000",
  F5: "225472.79069700",
  I2: "230479.7649",
  J2: "225472.79069700",
  E9: "12.50",
  E10: "1.50",
  E11: "9.00",
  F9: "99344.726250",
  F10: "11682.93980700",
  F11: "68667.07478400",
  F12: "179694.74084100",
  C16: "47685.4686",
  D16: "45778.04985600",
};

const EXPECTED_DISPLAY_MONEY: Record<string, string> = {
  F2: "₹99,344.73",
  F3: "₹11,682.94",
  F4: "₹114,445.12",
  F5: "₹225,472.79",
  I2: "₹230,479.76",
  J2: "₹225,472.79",
  F9: "₹99,344.73",
  F10: "₹11,682.94",
  F11: "₹68,667.07",
  F12: "₹179,694.74",
  C16: "₹47,685.47",
  D16: "₹45,778.05",
};

describe("financialCalculator sample regressions", () => {
  it("matches exact raw values for all mandatory cells", () => {
    const result = calculateFinancialSheet(SAMPLE_INPUTS);

    for (const [cell, expected] of Object.entries(EXPECTED_RAW)) {
      expect(result.cells[cell]?.rawValue).toBe(expected);
    }
  });

  it("matches displayed money values for all money cells", () => {
    const result = calculateFinancialSheet(SAMPLE_INPUTS);

    for (const [cell, expected] of Object.entries(EXPECTED_DISPLAY_MONEY)) {
      expect(result.cells[cell]?.displayValue).toBe(expected);
    }
  });
});

describe("financialCalculator validations and determinism", () => {
  it("does not coerce high precision inputs to Number precision", () => {
    const result = calculateFinancialSheet({
      A2: "0.123456789123456789123456789",
      C2: "1",
      A9: "1",
      D9: "0",
    });

    expect(result.cells.B2.rawValue).toBe("0.123456789123456789123456789");
    expect(result.cells.B2.rawValue.includes("e")).toBe(false);
  });

  it("returns empty input validation error", () => {
    const result = calculateFinancialSheet({ A2: "", C2: "1", A9: "2", D9: "3" });
    expect(result.errors).toContain("Enter all four values");
  });

  it("returns invalid decimal input error", () => {
    const result = calculateFinancialSheet({ A2: "abc", C2: "1", A9: "2", D9: "3" });
    expect(result.errors.some((error) => error.includes("A2 must be a valid decimal value"))).toBe(true);
  });

  it("returns negative input validation error", () => {
    const result = calculateFinancialSheet({ A2: "-1", C2: "1", A9: "2", D9: "3" });
    expect(result.errors.some((error) => error.includes("A2 must be greater than or equal to zero"))).toBe(true);
  });

  it("returns D4 negative validation error", () => {
    const result = calculateFinancialSheet({ A2: "1", C2: "10", A9: "1", D9: "0" });
    expect(result.errors.some((error) => error.includes("D4 = A9 - (D2 + D3)"))).toBe(true);
  });

  it("returns E11 negative validation error", () => {
    const result = calculateFinancialSheet({ A2: "1", C2: "10", A9: "50", D9: "1" });
    expect(result.errors.some((error) => error.includes("E11 = D9 - (E9 + E10)"))).toBe(true);
  });

  it("returns warning when D9 is greater than A9", () => {
    const result = calculateFinancialSheet({ A2: "1", C2: "1", A9: "2", D9: "3" });
    expect(result.warnings).toContain("Warning: D9 is greater than A9");
  });

  it("handles very large values without scientific notation", () => {
    const result = calculateFinancialSheet({
      A2: "999999999999999.9999",
      C2: "888888888888888.8888",
      A9: "777777777777777.7777",
      D9: "333333333333333.3333",
    });

    expect(result.cells.D16.rawValue.includes("e")).toBe(false);
  });

  it("supports values with more than four decimal places", () => {
    const result = calculateFinancialSheet({
      A2: "1.1234567",
      C2: "2.7654321",
      A9: "9.1234567",
      D9: "4.1234567",
    });

    expect(result.cells.B2.rawValue).toBe("1.1234567");
    expect(result.cells.D2.rawValue).toBe("3.456790125");
  });

  it("returns identical output for repeated calculations", () => {
    const first = calculateFinancialSheet(SAMPLE_INPUTS);
    const second = calculateFinancialSheet(SAMPLE_INPUTS);
    expect(second).toEqual(first);
  });

  it("recalculates dependent cells when one input changes", () => {
    const base = calculateFinancialSheet(SAMPLE_INPUTS);
    const changed = calculateFinancialSheet({ ...SAMPLE_INPUTS, A9: "30" });
    expect(changed.cells.I2.rawValue).not.toBe(base.cells.I2.rawValue);
    expect(changed.cells.D16.rawValue).not.toBe(base.cells.D16.rawValue);
  });

  it("uses unrounded intermediates for final totals", () => {
    const result = calculateFinancialSheet({
      A2: "1.005",
      C2: "10",
      A9: "29",
      D9: "23",
    });

    expect(result.finalAfterSpecialCondition).toBe("5.7888000");

    const roundedIntermediatePath = calculateFinancialSheet({
      A2: "1.01",
      C2: "10",
      A9: "29",
      D9: "23",
    });

    expect(result.cells.D16.displayValue).toBe("₹5.79");
    expect(roundedIntermediatePath.cells.D16.displayValue).toBe("₹5.82");
  });

  it("formatting does not affect raw values", () => {
    const result = calculateFinancialSheet(SAMPLE_INPUTS);
    const raw = result.cells.D16.rawValue;
    const formatted = formatMoney(raw);

    expect(raw).toBe("45778.04985600");
    expect(formatted).toBe("₹45,778.05");
    expect(result.cells.D16.rawValue).toBe(raw);
  });

  it("handles zero values", () => {
    const result = calculateFinancialSheet({ A2: "0", C2: "0", A9: "0", D9: "0" });
    expect(result.cells.D16.rawValue).toBe("0.0000");
    expect(result.cells.D16.displayValue).toBe("₹0.00");
  });

  it("handles values smaller than ₹0.01", () => {
    expect(formatMoney("0.004")).toBe("₹0.00");
    expect(formatMoney("0.005")).toBe("₹0.01");
  });

  it("uses ROUND_HALF_UP boundaries", () => {
    expect(formatMoney("1.004")).toBe("₹1.00");
    expect(formatMoney("1.005")).toBe("₹1.01");
    expect(formatMoney("1.006")).toBe("₹1.01");
  });
});
