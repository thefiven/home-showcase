import type { Availability } from "./strapi/types";

function toUtcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * Vrai si `date` tombe dans une des plages bloquées (bornes inclusives : une
 * plage `startDate` = `endDate` bloque bien ce jour). Les plages qui se
 * chevauchent n'ont pas besoin d'être fusionnées au préalable : chacune est
 * testée indépendamment.
 */
export function isDateBlocked(date: Date, ranges: Pick<Availability, "startDate" | "endDate">[]): boolean {
  const day = toUtcDay(date);
  return ranges.some((range) => {
    const start = toUtcDay(new Date(range.startDate));
    const end = toUtcDay(new Date(range.endDate));
    return day >= start && day <= end;
  });
}

/**
 * Étend les plages bloquées en un ensemble de dates ISO (`YYYY-MM-DD`) pour
 * une fenêtre d'affichage donnée (ex. mois courant + mois suivant), afin
 * d'éviter d'expanser des plages arbitrairement lointaines dans le temps.
 */
export function getBlockedDatesInWindow(
  ranges: Pick<Availability, "startDate" | "endDate">[],
  windowStart: Date,
  windowEnd: Date,
): Set<string> {
  const blocked = new Set<string>();
  const cursor = new Date(toUtcDay(windowStart));
  const end = toUtcDay(windowEnd);

  while (toUtcDay(cursor) <= end) {
    if (isDateBlocked(cursor, ranges)) {
      blocked.add(cursor.toISOString().slice(0, 10));
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return blocked;
}
