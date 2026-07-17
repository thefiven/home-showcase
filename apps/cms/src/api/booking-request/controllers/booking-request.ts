/**
 * booking-request controller
 */

import { factories } from "@strapi/strapi";
import { validateBookingRequestInput, type BookingRequestInput } from "../services/validation";

const VALIDATION_MESSAGES: Record<string, string> = {
  MISSING_FIELDS: "Champs obligatoires manquants.",
  INVALID_DATE_RANGE: "La date de fin doit être postérieure ou égale à la date de début.",
  DATE_IN_PAST: "La date de début ne peut pas être dans le passé.",
  DATE_UNAVAILABLE: "Les dates demandées chevauchent une période indisponible.",
};

interface CreateContext {
  request: { body?: { data?: BookingRequestInput } };
  badRequest: (message: string) => unknown;
}

export default factories.createCoreController(
  "api::booking-request.booking-request",
  ({ strapi }) => ({
    /**
     * Public endpoint (issue #9): a visitor submits this unauthenticated.
     * `bookingStatus`/`statusChangedAt` are always overwritten server-side so
     * a crafted request body can't self-approve a booking.
     */
    async create(ctx) {
      const context = ctx as unknown as CreateContext;
      const input = context.request.body?.data ?? {};

      const existingAvailabilities = input.property
        ? await strapi
            .documents("api::availability.availability")
            .findMany({ filters: { property: { documentId: input.property as string } } })
        : [];
      const blockedRanges = existingAvailabilities
        .filter((availability) => availability.startDate && availability.endDate)
        .map((availability) => ({
          startDate: availability.startDate as string,
          endDate: availability.endDate as string,
        }));

      const validationError = validateBookingRequestInput(input, blockedRanges);
      if (validationError) {
        return context.badRequest(VALIDATION_MESSAGES[validationError]);
      }

      const sanitizedInput: BookingRequestInput = { ...input };
      delete sanitizedInput.bookingStatus;
      delete sanitizedInput.statusChangedAt;
      context.request.body = { data: { ...sanitizedInput, bookingStatus: "pending" } };

      return await super.create(ctx);
    },
  }),
);
