import { describe, expect, it } from "vitest";
import {
  applyDateClick,
  cellState,
  isPastDate,
  rangeContainsBlocked,
  selectDate,
  type DateRange,
} from "./dateRange";

const EMPTY: DateRange = { start: null, end: null };

describe("applyDateClick", () => {
  it("pose la date de début quand la plage est vide", () => {
    expect(applyDateClick(EMPTY, "2026-08-10")).toEqual({ start: "2026-08-10", end: null });
  });

  it("pose la date de fin quand un début est déjà posé", () => {
    const range = { start: "2026-08-10", end: null };
    expect(applyDateClick(range, "2026-08-15")).toEqual({ start: "2026-08-10", end: "2026-08-15" });
  });

  it("produit une plage d'un seul jour si on clique deux fois la même date", () => {
    const range = { start: "2026-08-10", end: null };
    expect(applyDateClick(range, "2026-08-10")).toEqual({ start: "2026-08-10", end: "2026-08-10" });
  });

  it("redémarre la sélection si le clic est avant le début", () => {
    const range = { start: "2026-08-10", end: null };
    expect(applyDateClick(range, "2026-08-05")).toEqual({ start: "2026-08-05", end: null });
  });

  it("redémarre la sélection si la plage était déjà complète", () => {
    const range = { start: "2026-08-10", end: "2026-08-15" };
    expect(applyDateClick(range, "2026-08-20")).toEqual({ start: "2026-08-20", end: null });
  });
});

describe("rangeContainsBlocked", () => {
  it("détecte une date bloquée strictement à l'intérieur de la plage", () => {
    const blocked = new Set(["2026-08-12"]);
    expect(rangeContainsBlocked("2026-08-10", "2026-08-15", blocked)).toBe(true);
  });

  it("détecte une date bloquée sur une borne (bornes inclusives)", () => {
    const blocked = new Set(["2026-08-10"]);
    expect(rangeContainsBlocked("2026-08-10", "2026-08-15", blocked)).toBe(true);
  });

  it("retourne faux quand aucune date de la plage n'est bloquée", () => {
    const blocked = new Set(["2026-09-01"]);
    expect(rangeContainsBlocked("2026-08-10", "2026-08-15", blocked)).toBe(false);
  });
});

describe("selectDate", () => {
  it("se comporte comme applyDateClick sans date bloquée", () => {
    const range = { start: "2026-08-10", end: null };
    expect(selectDate(range, "2026-08-15", new Set())).toEqual({
      start: "2026-08-10",
      end: "2026-08-15",
    });
  });

  it("redémarre sur la date cliquée si la plage traverse une date bloquée", () => {
    const range = { start: "2026-08-10", end: null };
    const blocked = new Set(["2026-08-12"]);
    expect(selectDate(range, "2026-08-15", blocked)).toEqual({ start: "2026-08-15", end: null });
  });
});

describe("cellState", () => {
  it("retourne none sans sélection", () => {
    expect(cellState("2026-08-10", EMPTY)).toBe("none");
  });

  it("retourne start quand seul le début est posé", () => {
    expect(cellState("2026-08-10", { start: "2026-08-10", end: null })).toBe("start");
    expect(cellState("2026-08-11", { start: "2026-08-10", end: null })).toBe("none");
  });

  it("retourne start/end/between sur une plage complète", () => {
    const range = { start: "2026-08-10", end: "2026-08-13" };
    expect(cellState("2026-08-10", range)).toBe("start");
    expect(cellState("2026-08-11", range)).toBe("between");
    expect(cellState("2026-08-12", range)).toBe("between");
    expect(cellState("2026-08-13", range)).toBe("end");
    expect(cellState("2026-08-14", range)).toBe("none");
  });

  it("retourne start sur une plage d'un seul jour", () => {
    const range = { start: "2026-08-10", end: "2026-08-10" };
    expect(cellState("2026-08-10", range)).toBe("start");
  });
});

describe("isPastDate", () => {
  it("détecte une date strictement antérieure", () => {
    expect(isPastDate("2026-08-01", "2026-08-02")).toBe(true);
  });

  it("ne considère pas aujourd'hui comme passé", () => {
    expect(isPastDate("2026-08-02", "2026-08-02")).toBe(false);
  });

  it("ne considère pas une date future comme passée", () => {
    expect(isPastDate("2026-08-03", "2026-08-02")).toBe(false);
  });
});
