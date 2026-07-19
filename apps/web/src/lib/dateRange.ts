export interface DateRange {
  start: string | null;
  end: string | null;
}

/** Vrai si un jour de `[start, end]` (bornes incluses) est dans `blocked`. */
export function rangeContainsBlocked(start: string, end: string, blocked: Set<string>): boolean {
  const cursor = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`).getTime();

  while (cursor.getTime() <= last) {
    if (blocked.has(cursor.toISOString().slice(0, 10))) return true;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return false;
}

/**
 * Machine à états du clic sur une case du calendrier : pas de début, ou plage
 * déjà complète → redémarre sur `iso`. Un début posé et un clic sur une date
 * antérieure redémarre aussi (plutôt que de rejeter silencieusement). Un clic
 * sur la même date que le début produit une plage d'un seul jour.
 */
export function applyDateClick(range: DateRange, iso: string): DateRange {
  if (!range.start || range.end) {
    return { start: iso, end: null };
  }
  if (iso < range.start) {
    return { start: iso, end: null };
  }
  return { start: range.start, end: iso };
}

/**
 * Applique le clic puis redémarre la sélection sur `iso` si la plage
 * résultante chevauche une date bloquée par la sync iCal (critère d'#69 :
 * aucune plage ne doit traverser une date indisponible).
 */
export function selectDate(range: DateRange, iso: string, blocked: Set<string>): DateRange {
  const next = applyDateClick(range, iso);
  if (next.start && next.end && rangeContainsBlocked(next.start, next.end, blocked)) {
    return { start: iso, end: null };
  }
  return next;
}

export type CellState = "start" | "end" | "between" | "none";

/** État d'affichage d'une case du calendrier vis-à-vis de la sélection courante. */
export function cellState(iso: string, range: DateRange): CellState {
  if (!range.start) return "none";
  if (!range.end) return iso === range.start ? "start" : "none";
  if (iso === range.start && iso === range.end) return "start";
  if (iso === range.start) return "start";
  if (iso === range.end) return "end";
  if (iso > range.start && iso < range.end) return "between";
  return "none";
}

/** Vrai si `iso` est strictement avant `todayIso` (comparaison lexicographique, format `YYYY-MM-DD`). */
export function isPastDate(iso: string, todayIso: string): boolean {
  return iso < todayIso;
}
