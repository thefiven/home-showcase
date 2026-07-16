import type { Core, Modules } from "@strapi/strapi";

const DEFAULT_ICAL_SYNC_CRON = "0 * * * *";

export function createCronTasks(
  env: Core.Config.Shared.ConfigParams["env"],
): Modules.Cron.CronTasks {
  return {
    icalSync: {
      task: async ({ strapi }: { strapi: Core.Strapi }) => {
        await strapi.service("api::availability.availability").syncAll();
      },
      options: {
        rule: env("ICAL_SYNC_CRON", DEFAULT_ICAL_SYNC_CRON),
      },
    },
  };
}
