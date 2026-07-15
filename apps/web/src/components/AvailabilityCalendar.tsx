import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Availability } from "@/lib/strapi/types";
import { getBlockedDatesInWindow } from "@/lib/availability";
import styles from "./AvailabilityCalendar.module.css";

interface AvailabilityCalendarProps {
  availabilities: Availability[];
  locale: Locale;
  dictionary: Dictionary;
}

/**
 * Premier jour de la semaine (1 = lundi ... 7 = dimanche) pour `locale`, avec
 * repli sur lundi. Selon la version du moteur JS, `Intl.Locale` expose cette
 * information via la méthode `getWeekInfo()` ou via la propriété `weekInfo`
 * (ancienne forme, encore utilisée par le Node de cet environnement).
 */
function firstWeekday(locale: Locale): number {
  const withWeekInfo = new Intl.Locale(locale) as Intl.Locale & {
    getWeekInfo?: () => { firstDay: number };
    weekInfo?: { firstDay: number };
  };
  const weekInfo = withWeekInfo.getWeekInfo?.() ?? withWeekInfo.weekInfo;
  return weekInfo?.firstDay ?? 1;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Grille d'un mois : semaines complètes (jours hors mois = `null`) alignées sur `startOfWeek`. */
function buildMonthWeeks(monthStart: Date, startOfWeek: number): (Date | null)[][] {
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

function MonthGrid({
  monthStart,
  startOfWeek,
  blockedDates,
  locale,
  dictionary,
}: {
  monthStart: Date;
  startOfWeek: number;
  blockedDates: Set<string>;
  locale: Locale;
  dictionary: Dictionary;
}) {
  const weeks = buildMonthWeeks(monthStart, startOfWeek);
  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
    monthStart,
  );
  const weekdayFormatter = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  const weekdayLabels = weeks[0].map((_, index) => {
    const isoWeekday = ((startOfWeek - 1 + index) % 7) + 1;
    const reference = new Date(Date.UTC(2026, 0, 4 + isoWeekday)); // 2026-01-04 est un dimanche
    return weekdayFormatter.format(reference);
  });
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" });

  return (
    <div className={styles.month}>
      <h3 className={styles.monthLabel}>{monthLabel}</h3>
      <div className={styles.weekdays}>
        {weekdayLabels.map((label, index) => (
          <span key={index} className={styles.weekday}>
            {label}
          </span>
        ))}
      </div>
      <div className={styles.grid}>
        {weeks.flatMap((week, weekIndex) =>
          week.map((date, dayIndex) => {
            if (!date) {
              return (
                <span
                  key={`${weekIndex}-${dayIndex}`}
                  className={styles.empty}
                  aria-hidden="true"
                />
              );
            }
            const iso = toIsoDate(date);
            const blocked = blockedDates.has(iso);
            const formattedDate = dateFormatter.format(date);
            const label = (
              blocked ? dictionary.calendar.blockedLabel : dictionary.calendar.availableLabel
            ).replace("{date}", formattedDate);
            return (
              <span
                key={iso}
                className={blocked ? `${styles.day} ${styles.blocked}` : styles.day}
                aria-label={label}
              >
                {date.getUTCDate()}
              </span>
            );
          }),
        )}
      </div>
    </div>
  );
}

/**
 * Calendrier de disponibilité (mois courant + mois suivant) affichant les
 * dates bloquées de façon visuellement distincte, à partir des plages
 * `Availability` récupérées côté Strapi (SPEC.md §2).
 */
export function AvailabilityCalendar({
  availabilities,
  locale,
  dictionary,
}: AvailabilityCalendarProps) {
  const now = new Date();
  const currentMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const windowEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 2, 0));

  const blockedDates = getBlockedDatesInWindow(availabilities, currentMonthStart, windowEnd);
  const startOfWeek = firstWeekday(locale);

  return (
    <section className={styles.calendar}>
      <h2>{dictionary.calendar.title}</h2>
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatch} />
          {dictionary.calendar.legendAvailable}
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendSwatch} ${styles.legendSwatchBlocked}`} />
          {dictionary.calendar.legendBlocked}
        </span>
      </div>
      <div className={styles.months}>
        <MonthGrid
          monthStart={currentMonthStart}
          startOfWeek={startOfWeek}
          blockedDates={blockedDates}
          locale={locale}
          dictionary={dictionary}
        />
        <MonthGrid
          monthStart={nextMonthStart}
          startOfWeek={startOfWeek}
          blockedDates={blockedDates}
          locale={locale}
          dictionary={dictionary}
        />
      </div>
    </section>
  );
}
