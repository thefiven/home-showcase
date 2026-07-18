import type { Core } from "@strapi/strapi";
import { ensureLocales, ensureOwnerRole, ensurePublicPermissions } from "./bootstrap";
import { deriveApproximateLocationMiddleware } from "./documents-middlewares/derive-approximate-location";

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.documents.use(deriveApproximateLocationMiddleware);
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await ensureLocales({ strapi });
    await ensurePublicPermissions({ strapi });
    await ensureOwnerRole({ strapi });
  },
};
