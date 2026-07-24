import { assertSafeIcalUrl, UnsafeIcalUrlError } from "../../../availability/services/ical-url-guard";

interface WriteEvent {
  params: {
    data: Record<string, unknown>;
  };
}

/**
 * Rejects an `icalUrl` that isn't a public https:// host at write time, so
 * the low-privilege "Propriétaire" role (issue #56) can't turn the sync cron
 * into an SSRF probe of internal/cluster hosts just by editing a property.
 */
async function validateIcalUrl(event: WriteEvent): Promise<void> {
  const icalUrl = event.params.data.icalUrl;
  if (typeof icalUrl !== "string" || icalUrl.length === 0) {
    return;
  }

  try {
    await assertSafeIcalUrl(icalUrl);
  } catch (error) {
    if (error instanceof UnsafeIcalUrlError) {
      throw new Error(`Invalid icalUrl: ${error.message}`);
    }
    throw error;
  }
}

export default {
  async beforeCreate(event: WriteEvent) {
    await validateIcalUrl(event);
  },
  async beforeUpdate(event: WriteEvent) {
    await validateIcalUrl(event);
  },
};
