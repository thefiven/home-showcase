"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Availability } from "@/lib/strapi/types";
import { getBlockedDatesInWindow } from "@/lib/availability";
import { buildMonthWeeks, firstWeekday } from "@/lib/calendarGrid";

const DAY_CELL =
  "flex aspect-square min-w-[34px] items-center justify-center rounded-flat font-mono text-[13px]";
const MIN_OFFSET = 0;
const MAX_OFFSET = 11; // Le mois affiché le plus tardif reste le mois courant + 12.
const NAV_BUTTON =
  "flex h-8 w-8 items-center justify-center rounded-flat border border-border-strong font-mono disabled:cursor-not-allowed disabled:opacity-40";

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
 * Calendrier de disponibilité (2 mois affichés) navigable mois par mois,
 * borné entre le mois courant et courant+12 (issue #53). Les disponibilités
 * sont toutes récupérées côté serveur en amont (pas de fenêtre côté API) :
 * la navigation ne fait que recalculer la fenêtre affichée côté client.
 */
export function AvailabilityCalendar({
  availabilities,
  locale,
  dictionary,
}: AvailabilityCalendarProps) {
  const [monthOffset, setMonthOffset] = useState(0);

  const now = new Date();
  const firstMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + monthOffset, 1),
  );
  const secondMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + monthOffset + 1, 1),
  );
  const windowEnd = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + monthOffset + 2, 0),
  );

  const blockedDates = getBlockedDatesInWindow(availabilities, firstMonthStart, windowEnd);
  const startOfWeek = firstWeekday(locale);

  return (
    <section className="flex flex-col gap-8">
      <p className="font-mono text-xs uppercase tracking-[0.12em] text-foreground-soft">
        {dictionary.calendar.eyebrow}
      </p>
      <h2>{dictionary.calendar.title}</h2>
      <p className="max-w-[58ch] text-foreground-muted">{dictionary.calendar.intro}</p>
      <div className="flex flex-wrap items-center justify-between gap-8">
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
        <div className="flex gap-2">
          <button
            type="button"
            className={NAV_BUTTON}
            disabled={monthOffset === MIN_OFFSET}
            aria-label={dictionary.calendar.previousMonth}
            onClick={() => setMonthOffset((offset) => Math.max(MIN_OFFSET, offset - 1))}
          >
            ‹
          </button>
          <button
            type="button"
            className={NAV_BUTTON}
            disabled={monthOffset === MAX_OFFSET}
            aria-label={dictionary.calendar.nextMonth}
            onClick={() => setMonthOffset((offset) => Math.min(MAX_OFFSET, offset + 1))}
          >
            ›
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-[var(--gap-cols)]">
        <MonthGrid
          monthStart={firstMonthStart}
          startOfWeek={startOfWeek}
          blockedDates={blockedDates}
          locale={locale}
          dictionary={dictionary}
        />
        <MonthGrid
          monthStart={secondMonthStart}
          startOfWeek={startOfWeek}
          blockedDates={blockedDates}
          locale={locale}
          dictionary={dictionary}
        />
      </div>
    </section>
  );
}
