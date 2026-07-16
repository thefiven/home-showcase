/**
 * availability service
 */

import { factories } from "@strapi/strapi";
import type { Core } from "@strapi/strapi";
import { parseIcalEvents, reconcile } from "./ical";

type PropertyRecord = {
  documentId: string;
  name: string;
  icalUrl?: string | null;
};

type SyncSummary = {
  created: number;
  updated: number;
  deleted: number;
};

const EMPTY_SUMMARY: SyncSummary = { created: 0, updated: 0, deleted: 0 };

export default factories.createCoreService(
  "api::availability.availability",
  ({ strapi }: { strapi: Core.Strapi }) => ({
    /**
     * Imports the iCal export of a single property and reconciles its
     * `airbnb`-sourced Availability records against it. Errors (invalid URL,
     * unreachable host, unparsable iCal) are logged and swallowed so a single
     * broken property never aborts the rest of the sync (SPEC.md §5).
     */
    async syncProperty(property: PropertyRecord): Promise<SyncSummary> {
      if (!property.icalUrl) {
        return EMPTY_SUMMARY;
      }

      try {
        const response = await fetch(property.icalUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const icalBody = await response.text();
        const parsedEvents = parseIcalEvents(icalBody);

        const existing = await strapi.documents("api::availability.availability").findMany({
          filters: { property: { documentId: property.documentId }, source: "airbnb" },
        });

        const { toCreate, toUpdate, toDelete } = reconcile(existing, parsedEvents);

        for (const event of toCreate) {
          await strapi.documents("api::availability.availability").create({
            data: {
              property: property.documentId,
              source: "airbnb",
              externalUid: event.externalUid,
              startDate: event.startDate,
              endDate: event.endDate,
              summary: event.summary,
            },
          });
        }

        for (const { id, event } of toUpdate) {
          await strapi.documents("api::availability.availability").update({
            documentId: id as string,
            data: {
              startDate: event.startDate,
              endDate: event.endDate,
              summary: event.summary,
            },
          });
        }

        for (const { id } of toDelete) {
          await strapi
            .documents("api::availability.availability")
            .delete({ documentId: id as string });
        }

        return { created: toCreate.length, updated: toUpdate.length, deleted: toDelete.length };
      } catch (error) {
        strapi.log.error(
          `iCal sync failed for property "${property.name}": ${(error as Error).message}`,
        );
        return EMPTY_SUMMARY;
      }
    },

    /**
     * Syncs every Property that has an iCal URL configured, one at a time so
     * a failure on one property never skips the others.
     */
    async syncAll(): Promise<void> {
      const properties = await strapi.documents("api::property.property").findMany({
        filters: { icalUrl: { $notNull: true } },
      });

      let created = 0;
      let updated = 0;
      let deleted = 0;

      for (const property of properties) {
        const summary = await strapi
          .service("api::availability.availability")
          .syncProperty(property);
        created += summary.created;
        updated += summary.updated;
        deleted += summary.deleted;
      }

      strapi.log.info(
        `iCal sync done for ${properties.length} propert${properties.length === 1 ? "y" : "ies"}: ${created} created, ${updated} updated, ${deleted} deleted.`,
      );
    },
  }),
);
