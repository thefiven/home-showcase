"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Availability } from "@/lib/strapi/types";
import { getBlockedDatesInWindow } from "@/lib/availability";
import { selectDate, type DateRange } from "@/lib/dateRange";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { BookingRequestForm } from "@/components/BookingRequestForm";

interface BookingSectionProps {
  availabilities: Availability[];
  locale: Locale;
  dictionary: Dictionary;
  propertyDocumentId: string;
}

const EMPTY_RANGE: DateRange = { start: null, end: null };

/**
 * Groups the calendar and the booking request form into a single card
 * (issue #69): range selection happens directly on the calendar and
 * automatically feeds the form's date fields, with no manual re-entry.
 */
export function BookingSection({
  availabilities,
  locale,
  dictionary,
  propertyDocumentId,
}: BookingSectionProps) {
  const [range, setRange] = useState<DateRange>(EMPTY_RANGE);

  const now = new Date();
  const windowStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const windowEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 13, 0));
  const blockedDates = getBlockedDatesInWindow(availabilities, windowStart, windowEnd);

  return (
    <section
      id="reservation"
      className="flex flex-col gap-[clamp(14px,3vw,16px)] rounded-flat bg-surface p-[clamp(20px,3vw,32px)]"
    >
      <AvailabilityCalendar
        availabilities={availabilities}
        locale={locale}
        dictionary={dictionary}
        selection={range}
        onDateClick={(iso) => setRange((current) => selectDate(current, iso, blockedDates))}
      />
      <BookingRequestForm
        propertyDocumentId={propertyDocumentId}
        dictionary={dictionary}
        locale={locale}
        range={range}
      />
    </section>
  );
}
