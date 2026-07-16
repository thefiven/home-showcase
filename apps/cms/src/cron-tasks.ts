import type { Core, Modules } from "@strapi/strapi";

const DEFAULT_ICAL_SYNC_CRON = "0 * * * *";

const cronTasks: Modules.Cron.CronTasks = {
  icalSync: {
    task: async ({ strapi }: { strapi: Core.Strapi }) => {
      await strapi.service("api::availability.availability").syncAll();
    },
    options: {
      rule: process.env.ICAL_SYNC_CRON || DEFAULT_ICAL_SYNC_CRON,
    },
  },
};

export default cronTasks;
