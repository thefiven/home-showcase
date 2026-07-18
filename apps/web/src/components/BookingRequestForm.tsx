"use client";

import { useActionState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import {
  submitBookingRequest,
  type BookingRequestState,
} from "@/app/[locale]/properties/[slug]/actions";

interface BookingRequestFormProps {
  propertyDocumentId: string;
  dictionary: Dictionary;
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
export function BookingRequestForm({ propertyDocumentId, dictionary }: BookingRequestFormProps) {
  const t = dictionary.booking;
  const action = submitBookingRequest.bind(null, propertyDocumentId);
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  if (state.status === "success") {
    return (
      <section
        className="grid items-start gap-[var(--gap-cols)] [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]"
        id="reservation"
      >
        <p className="text-[15px] text-success">{t.success}</p>
      </section>
    );
  }

  return (
    <section
      className="grid items-start gap-[var(--gap-cols)] [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]"
      id="reservation"
    >
      <div className="flex max-w-[40ch] flex-col gap-8">
        <h2>{t.title}</h2>
        <p className="text-foreground-muted">{t.airbnbNote}</p>
      </div>
      <form
        action={formAction}
        className="flex flex-col gap-[clamp(14px,3vw,16px)] rounded-flat bg-surface p-[clamp(20px,3vw,32px)]"
      >
        <div className="grid gap-[clamp(14px,3vw,16px)] [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
          <div className={FIELD}>
            <label htmlFor="startDate" className={LABEL}>
              {t.startDate}
            </label>
            <input type="date" id="startDate" name="startDate" required className={INPUT} />
          </div>
          <div className={FIELD}>
            <label htmlFor="endDate" className={LABEL}>
              {t.endDate}
            </label>
            <input type="date" id="endDate" name="endDate" required className={INPUT} />
          </div>
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
          disabled={isPending}
          className="self-start rounded-flat bg-atlantic px-13 py-7 font-semibold text-foreground-on-dark enabled:hover:bg-atlantic-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? t.submitting : t.submit}
        </button>
      </form>
    </section>
  );
}
