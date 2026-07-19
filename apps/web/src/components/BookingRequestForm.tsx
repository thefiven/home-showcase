"use client";

import { useActionState, useEffect, useRef } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { DateRange } from "@/lib/dateRange";
import {
  submitBookingRequest,
  type BookingRequestState,
} from "@/app/[locale]/properties/[slug]/actions";

interface BookingRequestFormProps {
  propertyDocumentId: string;
  dictionary: Dictionary;
  locale: Locale;
  range: DateRange;
}

const INITIAL_STATE: BookingRequestState = { status: "idle", errors: {} };
const FIELD = "flex flex-col gap-3";
const LABEL = "text-sm font-semibold";
const INPUT =
  "rounded-flat border border-border-strong bg-background px-6 py-[11px] text-foreground [font:inherit]";
const ERROR = "text-[13px] text-error";

/**
 * Formulaire de demande de réservation (issue #9). Soumission via Server
 * Action : la validation autoritaire et la création se font côté serveur
 * (`actions.ts`), donc pas de client Strapi appelé depuis le navigateur.
 */
export function BookingRequestForm({
  propertyDocumentId,
  dictionary,
  locale,
  range,
}: BookingRequestFormProps) {
  const t = dictionary.booking;
  const action = submitBookingRequest.bind(null, propertyDocumentId);
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" });
  const formatIso = (iso: string) => dateFormatter.format(new Date(`${iso}T00:00:00Z`));
  const rangeComplete = Boolean(range.start && range.end);
  const successRef = useRef<HTMLParagraphElement>(null);

  // Le succès remplace tout le formulaire par une seule ligne : la page
  // rétrécit fortement à l'endroit où l'utilisateur vient de cliquer
  // "Envoyer" (en bas du formulaire), donc son scroll se retrouve après le
  // message de confirmation, désormais bien plus haut. On le ramène dans le
  // viewport plutôt que de compter sur l'utilisateur pour remonter.
  useEffect(() => {
    if (state.status === "success") {
      successRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [state.status]);

  if (state.status === "success") {
    return (
      <p ref={successRef} className="text-[15px] text-success">
        {t.success}
      </p>
    );
  }

  return (
    <>
      <div className="flex max-w-[40ch] flex-col gap-8">
        <h2>{t.title}</h2>
        <p className="text-foreground-muted">{t.airbnbNote}</p>
      </div>
      <form action={formAction} className="flex flex-col gap-[clamp(14px,3vw,16px)]">
        <input type="hidden" name="startDate" value={range.start ?? ""} />
        <input type="hidden" name="endDate" value={range.end ?? ""} />
        <div className={FIELD}>
          <span className={LABEL}>{t.datesLabel}</span>
          <p className="text-[15px]">
            {rangeComplete && range.start && range.end
              ? t.selectedRange
                  .replace("{start}", formatIso(range.start))
                  .replace("{end}", formatIso(range.end))
              : t.selectDatesHint}
          </p>
        </div>
        {state.errors.startDate && <p className={ERROR}>{t.errors.required}</p>}
        {state.errors.endDate && !state.errors.startDate && (
          <p className={ERROR}>{t.errors.required}</p>
        )}
        {state.errors.dates && <p className={ERROR}>{t.errors[state.errors.dates]}</p>}

        <div className={FIELD}>
          <label htmlFor="guestName" className={LABEL}>
            {t.guestName}
          </label>
          <input type="text" id="guestName" name="guestName" required className={INPUT} />
          {state.errors.guestName && <p className={ERROR}>{t.errors.required}</p>}
        </div>

        <div className={FIELD}>
          <label htmlFor="guestEmail" className={LABEL}>
            {t.guestEmail}
          </label>
          <input type="email" id="guestEmail" name="guestEmail" required className={INPUT} />
          {state.errors.guestEmail && <p className={ERROR}>{t.errors.required}</p>}
        </div>

        <div className={FIELD}>
          <label htmlFor="guestPhone" className={LABEL}>
            {t.guestPhone}
          </label>
          <input type="tel" id="guestPhone" name="guestPhone" className={INPUT} />
        </div>

        <div className={FIELD}>
          <label htmlFor="numberOfGuests" className={LABEL}>
            {t.numberOfGuests}
          </label>
          <input
            type="number"
            id="numberOfGuests"
            name="numberOfGuests"
            min={1}
            className={INPUT}
          />
        </div>

        <div className={FIELD}>
          <label htmlFor="message" className={LABEL}>
            {t.message}
          </label>
          <textarea id="message" name="message" rows={4} className={INPUT} />
        </div>

        {state.errorMessage && <p className={ERROR}>{state.errorMessage}</p>}

        <button
          type="submit"
          disabled={isPending || !rangeComplete}
          className="self-start rounded-flat bg-atlantic px-13 py-7 font-semibold text-foreground-on-dark enabled:hover:bg-atlantic-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? t.submitting : t.submit}
        </button>
      </form>
    </>
  );
}
