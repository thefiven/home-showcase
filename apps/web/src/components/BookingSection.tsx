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
 * Regroupe calendrier et formulaire de réservation dans une seule carte
 * (issue #69) : la sélection de plage se fait directement sur le calendrier
 * et alimente automatiquement les champs de dates du formulaire, sans
 * ressaisie manuelle.
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
