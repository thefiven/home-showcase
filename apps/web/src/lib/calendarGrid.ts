import type { Locale } from "@/i18n/config";

/**
 * Premier jour de la semaine (1 = lundi ... 7 = dimanche) pour `locale`, avec
 * repli sur lundi. Selon la version du moteur JS, `Intl.Locale` expose cette
 * information via la méthode `getWeekInfo()` ou via la propriété `weekInfo`
 * (ancienne forme, encore utilisée par le Node de cet environnement).
 */
export function firstWeekday(locale: Locale): number {
  const withWeekInfo = new Intl.Locale(locale) as Intl.Locale & {
    getWeekInfo?: () => { firstDay: number };
    weekInfo?: { firstDay: number };
  };
  const weekInfo = withWeekInfo.getWeekInfo?.() ?? withWeekInfo.weekInfo;
  return weekInfo?.firstDay ?? 1;
}

/** Grille d'un mois : semaines complètes (jours hors mois = `null`) alignées sur `startOfWeek`. */
export function buildMonthWeeks(monthStart: Date, startOfWeek: number): (Date | null)[][] {
  const year = monthStart.getUTCFullYear();
  const month = monthStart.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const days: (Date | null)[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(Date.UTC(year, month, day)));
  }

  const isoWeekday = (date: Date) => ((date.getUTCDay() + 6) % 7) + 1; // 1 = lundi ... 7 = dimanche
  const leadingBlanks = (isoWeekday(days[0]!) - startOfWeek + 7) % 7;
  const padded: (Date | null)[] = [...Array(leadingBlanks).fill(null), ...days];
  while (padded.length % 7 !== 0) padded.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }
  return weeks;
}
