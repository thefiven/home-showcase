import { describe, expect, it } from "vitest";
import { formatAmount } from "./pricing";

describe("formatAmount", () => {
  it("formats an amount in euros without decimals", () => {
    expect(formatAmount(145, "EUR")).toBe("145€");
  });

  it("formats an amount in dollars", () => {
    expect(formatAmount(120, "USD")).toBe("120$");
  });

  it("formats an amount in pounds sterling", () => {
    expect(formatAmount(90, "GBP")).toBe("90£");
  });

  it("rounds decimals", () => {
    expect(formatAmount(99.5, "EUR")).toBe("100€");
    expect(formatAmount(99.4, "EUR")).toBe("99€");
  });
});
