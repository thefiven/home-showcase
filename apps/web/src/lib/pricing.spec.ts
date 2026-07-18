import { describe, expect, it } from "vitest";
import { formatAmount } from "./pricing";

describe("formatAmount", () => {
  it("formate un montant en euros sans décimales", () => {
    expect(formatAmount(145, "EUR")).toBe("145€");
  });

  it("formate un montant en dollars", () => {
    expect(formatAmount(120, "USD")).toBe("120$");
  });

  it("formate un montant en livres sterling", () => {
    expect(formatAmount(90, "GBP")).toBe("90£");
  });

  it("arrondit les décimales", () => {
    expect(formatAmount(99.5, "EUR")).toBe("100€");
    expect(formatAmount(99.4, "EUR")).toBe("99€");
  });
});
