import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Availability } from "@/lib/strapi/types";
import { getBlockedDatesInWindow } from "@/lib/availability";
import { buildMonthWeeks, firstWeekday } from "@/lib/calendarGrid";

const DAY_CELL =
  "flex aspect-square min-w-[34px] items-center justify-center rounded-flat font-mono text-[13px]";

interface AvailabilityCalendarProps {
  availabilities: Availability[];
  locale: Locale;
  dictionary: Dictionary;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
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
    <div className="flex-[1_1_300px] min-w-[300px]">
      <h3 className="mb-8 text-[18px] capitalize">{monthLabel}</h3>
      <div className="grid grid-cols-7 gap-2">
        {weekdayLabels.map((label, index) => (
          <span
            key={index}
            className="text-center font-mono text-xs capitalize text-foreground-soft"
          >
            {label}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {weeks.flatMap((week, weekIndex) =>
          week.map((date, dayIndex) => {
            if (!date) {
              return (
                <span key={`${weekIndex}-${dayIndex}`} className={DAY_CELL} aria-hidden="true" />
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
                className={
                  blocked
                    ? `${DAY_CELL} border border-unavailable bg-unavailable text-foreground-on-dark line-through`
                    : `${DAY_CELL} border border-border-strong bg-background`
                }
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
    <section className="flex flex-col gap-8">
      <p className="font-mono text-xs uppercase tracking-[0.12em] text-foreground-soft">
        {dictionary.calendar.eyebrow}
      </p>
      <h2>{dictionary.calendar.title}</h2>
      <p className="max-w-[58ch] text-foreground-muted">{dictionary.calendar.intro}</p>
      <div className="flex flex-wrap gap-8 font-mono text-[13px]">
        <span className="inline-flex items-center gap-3">
          <span className="h-3 w-3 rounded-flat border border-border-strong bg-background" />
          {dictionary.calendar.legendAvailable}
        </span>
        <span className="inline-flex items-center gap-3">
          <span className="h-3 w-3 rounded-flat border border-unavailable bg-unavailable" />
          {dictionary.calendar.legendBlocked}
        </span>
      </div>
      <div className="flex flex-wrap gap-[var(--gap-cols)]">
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
