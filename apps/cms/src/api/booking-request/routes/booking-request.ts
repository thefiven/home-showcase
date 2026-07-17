/**
 * booking-request router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::booking-request.booking-request", {
  config: {
    // `create` is the public, unauthenticated endpoint (issue #9) — rate
    // limit it (issue #42) since it now also triggers a real SMTP send.
    create: {
      middlewares: ["api::booking-request.booking-request.rate-limit"],
    },
  },
});
