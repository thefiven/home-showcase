import { afterEach, describe, expect, it, vi } from "vitest";
import { buildMonthWeeks, firstWeekday } from "./calendarGrid";

function flattenNonNull(weeks: (Date | null)[][]): Date[] {
  return weeks.flat().filter((date): date is Date => date !== null);
}

describe("buildMonthWeeks", () => {
  it("n'a aucun blanc en tête quand le mois commence un lundi et startOfWeek=1", () => {
    const weeks = buildMonthWeeks(new Date(Date.UTC(2026, 5, 1)), 1); // juin 2026 commence un lundi
    expect(weeks[0][0]).toEqual(new Date(Date.UTC(2026, 5, 1)));
  });

  it("ajoute les blancs de tête attendus quand le mois commence un dimanche", () => {
    const weeks = buildMonthWeeks(new Date(Date.UTC(2026, 1, 1)), 1); // février 2026 commence un dimanche
    const firstWeek = weeks[0];
    expect(firstWeek.slice(0, 6)).toEqual([null, null, null, null, null, null]);
    expect(firstWeek[6]).toEqual(new Date(Date.UTC(2026, 1, 1)));
  });

  it("ajoute les blancs de tête attendus quand le mois commence en milieu de semaine", () => {
    const weeks = buildMonthWeeks(new Date(Date.UTC(2026, 3, 1)), 1); // avril 2026 commence un mercredi
    const firstWeek = weeks[0];
    expect(firstWeek.slice(0, 2)).toEqual([null, null]);
    expect(firstWeek[2]).toEqual(new Date(Date.UTC(2026, 3, 1)));
  });

  it("aligne différemment le même mois selon startOfWeek", () => {
    const monthStart = new Date(Date.UTC(2026, 1, 1)); // dimanche
    const weeksFromMonday = buildMonthWeeks(monthStart, 1);
    const weeksFromSunday = buildMonthWeeks(monthStart, 7);

    const leadingBlanks = (weeks: (Date | null)[][]) => weeks[0].filter((d) => d === null).length;
    expect(leadingBlanks(weeksFromMonday)).toBe(6);
    expect(leadingBlanks(weeksFromSunday)).toBe(0);
  });

  it.each([
    { label: "28 jours (fév 2026)", year: 2026, month: 1, days: 28 },
    { label: "29 jours (fév 2028, bissextile)", year: 2028, month: 1, days: 29 },
    { label: "30 jours (avr 2026)", year: 2026, month: 3, days: 30 },
    { label: "31 jours (jan 2026)", year: 2026, month: 0, days: 31 },
  ])("contient tous les jours du mois pour $label", ({ year, month, days }) => {
    const weeks = buildMonthWeeks(new Date(Date.UTC(year, month, 1)), 1);
    const nonNull = flattenNonNull(weeks);
    expect(nonNull).toHaveLength(days);
    expect(nonNull.map((d) => d.getUTCDate())).toEqual(
      Array.from({ length: days }, (_, i) => i + 1),
    );
  });

  it("retourne uniquement des semaines complètes de 7 cellules", () => {
    const weeks = buildMonthWeeks(new Date(Date.UTC(2026, 1, 1)), 1);
    for (const week of weeks) {
      expect(week).toHaveLength(7);
    }
    expect(weeks.flat().length % 7).toBe(0);
  });

  it("ne place des blancs qu'en tête et en queue, jamais entre deux jours du mois", () => {
    const weeks = buildMonthWeeks(new Date(Date.UTC(2026, 1, 1)), 1);
    const flat = weeks.flat();
    const firstNonNull = flat.findIndex((d) => d !== null);
    const lastNonNull = flat.length - 1 - [...flat].reverse().findIndex((d) => d !== null);
    for (let i = firstNonNull; i <= lastNonNull; i++) {
      expect(flat[i]).not.toBeNull();
    }
  });
});

describe("firstWeekday", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("retourne lundi (1) pour la locale fr", () => {
    expect(firstWeekday("fr")).toBe(1);
  });

  it("retourne le jour effectif du moteur pour la locale en", () => {
    const weekInfo = new Intl.Locale("en").weekInfo;
    expect(firstWeekday("en")).toBe(weekInfo?.firstDay);
  });

  it("replie sur lundi quand getWeekInfo/weekInfo sont indisponibles", () => {
    vi.spyOn(Intl, "Locale").mockImplementation(function (this: object) {
      return this;
    } as unknown as typeof Intl.Locale);

    expect(firstWeekday("fr")).toBe(1);
  });
});
