"use client";

import { useActionState } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import {
  initialBookingRequestState,
  submitBookingRequest,
} from "@/app/[locale]/properties/[slug]/actions";
import styles from "./BookingRequestForm.module.css";

interface BookingRequestFormProps {
  propertyDocumentId: string;
  dictionary: Dictionary;
}

/**
 * Formulaire de demande de réservation (issue #9). Soumission via Server
 * Action : la validation autoritaire et la création se font côté serveur
 * (`actions.ts`), donc pas de client Strapi appelé depuis le navigateur.
 */
export function BookingRequestForm({ propertyDocumentId, dictionary }: BookingRequestFormProps) {
  const t = dictionary.booking;
  const action = submitBookingRequest.bind(null, propertyDocumentId);
  const [state, formAction, isPending] = useActionState(action, initialBookingRequestState);

  if (state.status === "success") {
    return (
      <section className={styles.booking}>
        <p className={styles.success}>{t.success}</p>
      </section>
    );
  }

  return (
    <section className={styles.booking}>
      <h2>{t.title}</h2>
      <form action={formAction} className={styles.form}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="startDate">{t.startDate}</label>
            <input type="date" id="startDate" name="startDate" required />
          </div>
          <div className={styles.field}>
            <label htmlFor="endDate">{t.endDate}</label>
            <input type="date" id="endDate" name="endDate" required />
          </div>
        </div>
        {state.errors.startDate && <p className={styles.error}>{t.errors.required}</p>}
        {state.errors.endDate && !state.errors.startDate && (
          <p className={styles.error}>{t.errors.required}</p>
        )}
        {state.errors.dates && <p className={styles.error}>{t.errors[state.errors.dates]}</p>}

        <div className={styles.field}>
          <label htmlFor="guestName">{t.guestName}</label>
          <input type="text" id="guestName" name="guestName" required />
          {state.errors.guestName && <p className={styles.error}>{t.errors.required}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor="guestEmail">{t.guestEmail}</label>
          <input type="email" id="guestEmail" name="guestEmail" required />
          {state.errors.guestEmail && <p className={styles.error}>{t.errors.required}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor="guestPhone">{t.guestPhone}</label>
          <input type="tel" id="guestPhone" name="guestPhone" />
        </div>

        <div className={styles.field}>
          <label htmlFor="numberOfGuests">{t.numberOfGuests}</label>
          <input type="number" id="numberOfGuests" name="numberOfGuests" min={1} />
        </div>

        <div className={styles.field}>
          <label htmlFor="message">{t.message}</label>
          <textarea id="message" name="message" rows={4} />
        </div>

        {state.errorMessage && <p className={styles.error}>{state.errorMessage}</p>}

        <button type="submit" className={styles.submit} disabled={isPending}>
          {isPending ? t.submitting : t.submit}
        </button>
      </form>
    </section>
  );
}
