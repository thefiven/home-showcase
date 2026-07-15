import { describe, expect, it } from "vitest";
import { getBlockedDatesInWindow, isDateBlocked } from "./availability";

describe("isDateBlocked", () => {
  it("bloque une date strictement à l'intérieur d'une plage", () => {
    const ranges = [{ startDate: "2026-08-01", endDate: "2026-08-05" }];
    expect(isDateBlocked(new Date("2026-08-03"), ranges)).toBe(true);
  });

  it("bloque les bornes de la plage (inclusives)", () => {
    const ranges = [{ startDate: "2026-08-01", endDate: "2026-08-05" }];
    expect(isDateBlocked(new Date("2026-08-01"), ranges)).toBe(true);
    expect(isDateBlocked(new Date("2026-08-05"), ranges)).toBe(true);
  });

  it("bloque un jour unique quand startDate === endDate", () => {
    const ranges = [{ startDate: "2026-08-10", endDate: "2026-08-10" }];
    expect(isDateBlocked(new Date("2026-08-10"), ranges)).toBe(true);
    expect(isDateBlocked(new Date("2026-08-09"), ranges)).toBe(false);
  });

  it("ne bloque pas une date hors de toute plage", () => {
    const ranges = [{ startDate: "2026-08-01", endDate: "2026-08-05" }];
    expect(isDateBlocked(new Date("2026-08-06"), ranges)).toBe(false);
  });

  it("gère des plages qui se chevauchent sans fusion préalable", () => {
    const ranges = [
      { startDate: "2026-08-01", endDate: "2026-08-05" },
      { startDate: "2026-08-04", endDate: "2026-08-08" },
    ];
    expect(isDateBlocked(new Date("2026-08-06"), ranges)).toBe(true);
    expect(isDateBlocked(new Date("2026-08-09"), ranges)).toBe(false);
  });

  it("retourne false si aucune plage n'est fournie", () => {
    expect(isDateBlocked(new Date("2026-08-01"), [])).toBe(false);
  });
});

describe("getBlockedDatesInWindow", () => {
  it("retourne les dates ISO bloquées dans la fenêtre demandée", () => {
    const ranges = [{ startDate: "2026-08-03", endDate: "2026-08-04" }];
    const blocked = getBlockedDatesInWindow(ranges, new Date("2026-08-01"), new Date("2026-08-05"));
    expect(blocked).toEqual(new Set(["2026-08-03", "2026-08-04"]));
  });

  it("exclut les plages en dehors de la fenêtre d'affichage", () => {
    const ranges = [{ startDate: "2026-09-15", endDate: "2026-09-20" }];
    const blocked = getBlockedDatesInWindow(ranges, new Date("2026-08-01"), new Date("2026-08-31"));
    expect(blocked.size).toBe(0);
  });

  it("retourne un ensemble vide sans plage", () => {
    const blocked = getBlockedDatesInWindow([], new Date("2026-08-01"), new Date("2026-08-05"));
    expect(blocked.size).toBe(0);
  });
});
