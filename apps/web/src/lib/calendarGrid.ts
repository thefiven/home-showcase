import type { Locale } from "@/i18n/config";

/**
 * First day of the week (1 = Monday ... 7 = Sunday) for `locale`, falling
 * back to Monday. Depending on the JS engine version, `Intl.Locale`
 * exposes this information via the `getWeekInfo()` method or via the
 * `weekInfo` property (older form, still used by the Node runtime in
 * this environment).
 */
export function firstWeekday(locale: Locale): number {
  const withWeekInfo = new Intl.Locale(locale) as Intl.Locale & {
    getWeekInfo?: () => { firstDay: number };
    weekInfo?: { firstDay: number };
  };
  const weekInfo = withWeekInfo.getWeekInfo?.() ?? withWeekInfo.weekInfo;
  return weekInfo?.firstDay ?? 1;
}

/** Grid for a month: complete weeks (out-of-month days = `null`) aligned on `startOfWeek`. */
export function buildMonthWeeks(monthStart: Date, startOfWeek: number): (Date | null)[][] {
  const year = monthStart.getUTCFullYear();
  const month = monthStart.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const days: (Date | null)[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(Date.UTC(year, month, day)));
  }

  const isoWeekday = (date: Date) => ((date.getUTCDay() + 6) % 7) + 1; // 1 = Monday ... 7 = Sunday
  const leadingBlanks = (isoWeekday(days[0]!) - startOfWeek + 7) % 7;
  const padded: (Date | null)[] = [...Array(leadingBlanks).fill(null), ...days];
  while (padded.length % 7 !== 0) padded.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }
  return weeks;
}
