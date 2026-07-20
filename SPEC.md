# SPEC — home-showcase

> Scoping document. Summarizes the product/technical decisions made before development started.
> Conventions derived from these decisions (stack, folder structure, Git workflow, gitmoji, tests) are in `CLAUDE.md`.

## 1. Context & need

A showcase website for one or more Airbnb-style properties, designed as a **complement** to Airbnb (not a replacement):

- Main goal: provide a shareable asset for social media to attract new bookings.
- The site presents property information (photos, description, rates, amenities, location) the way an Airbnb listing would.
- Visitors can check availability and submit a **booking request**, which the owner accepts or declines manually.
- The owner is not technical: any content change (text, photos, rates) must be doable without touching code.

No deadline constraint: the project is developed at a normal pace, with no external deadline.

## 2. Functional scope

### Included in the MVP

- Presentation of **multiple properties**, each with its own listing (photos, FR/EN description, rates, amenities, location).
- **Multilingual FR/EN site** from the MVP (international Airbnb audience).
- **Availability calendar** per property, with booking requests submittable from this calendar.
- **Availability sync with Airbnb** via each listing's iCal export (periodic import, read-only — nothing is pushed back to Airbnb).
- **Back-office** letting the owner edit all content without developer involvement.
- **Booking request workflow**: the visitor submits a request (dates, contact info, message) → the owner is notified → they accept or decline from the back-office.
- **Email notification** for every new booking request.

### Out of MVP scope (future evolutions)

- **WhatsApp** notification (Twilio or WhatsApp Business API) — v2.
- Online payment / deposit.
- Export/write back to the Airbnb calendar (the flow stays one-directional: Airbnb → home-showcase).

## 3. Technical decisions

| Topic                        | Decision                                                                                                                                                                                                                                                                            |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend                     | Next.js (TypeScript), SSR/SSG rendering for SEO                                                                                                                                                                                                                                     |
| CMS                          | Strapi, self-hosted (rather than a SaaS like Sanity, to stay consistent with the target hosting)                                                                                                                                                                                    |
| Database                     | PostgreSQL (used by Strapi) — target and reference environment, started via `docker/docker-compose.yml` (issue #2). `apps/cms` can also run on SQLite locally outside Docker (issue #1, practical fallback without starting containers, but not guaranteed at parity with Postgres) |
| Containerization             | Docker from the start: `docker/docker-compose.yml` (Postgres + Strapi + Next.js) and multi-stage Dockerfiles (`dev`/`production`) per app — see README.md                                                                                                                           |
| Target hosting               | Homelab **k3s** (Kubernetes), not yet in place — the repo must stay "portable" (no dependency on a proprietary PaaS); Helm manifests in `deploy/helm/home-showcase/`                                                                                                                |
| Repo structure               | Monorepo: `apps/web` (Next.js) + `apps/cms` (Strapi), managed via `pnpm` workspaces                                                                                                                                                                                                 |
| Booking requests & iCal sync | Handled **in Strapi**: `booking-request` content-type (status pending/accepted/refused) + `availability` content-type populated by a Strapi cron job that imports Airbnb iCal feeds. Next.js consumes the Strapi API (no separate database or backend on the web side)              |
| Email notification           | Self-hosted SMTP via `@strapi/provider-email-nodemailer`, rather than Resend — consistent with the homelab approach (see §5)                                                                                                                                                        |
| WhatsApp notification        | Out of MVP scope, planned for v2                                                                                                                                                                                                                                                    |
| Testing strategy             | Targeted unit + integration tests (Vitest) on critical business logic (availability computation, booking workflow, iCal parsing) and API endpoints. End-to-end tests (Playwright) in `e2e/` on critical flows (availability, booking request)                                       |
| Git workflow                 | Solo but rigorous: branch per feature, gitmoji commits, systematic PR on GitHub before merging into `main` (via GitHub MCP integration), see `CLAUDE.md`                                                                                                                            |

## 4. Content model (Strapi) — overview

- **Property**: name, slug, FR/EN description, photos, address/location, rates, amenities, Airbnb iCal URL.
- **Availability**: blocked ranges per `Property`, populated automatically by the iCal sync job (read-only in the admin, no manual editing of imported blocks).
- **BookingRequest**: linked `Property`, requested dates, requester name/email/phone/number of guests, message, status (`pending` / `accepted` / `refused`), timestamp. Creation triggers the owner's notification email; transitioning to `accepted`/`refused` creates or removes the corresponding `Availability` (`apps/cms/src/documents-middlewares`).

This model has been implemented as described for the MVP (see `CLAUDE.md` for the current folder structure).

## 5. Decisions settled during implementation

- **Transactional email provider**: self-hosted SMTP via `@strapi/provider-email-nodemailer` (config `apps/cms/config/plugins.ts`, variables `SMTP_*`/`EMAIL_FROM`/`EMAIL_REPLY_TO`), rather than Resend — consistent with the homelab target. A send failure is logged but never blocks creation of the booking request.
- **iCal sync**: Strapi cron job (`apps/cms/src/cron-tasks`, service `apps/cms/src/api/availability/services/ical.ts`) that imports the Airbnb iCal export per `Property` and populates `Availability`. `DTEND` treated as exclusive (the checkout day becomes bookable again).
- **Location privacy**: the precise address is never exposed publicly; the web only receives an approximate position derived on the CMS side (Document Service middleware on `Property`).

## 6. Open points / to be decided later

- **WhatsApp integration details** (v2): provider choice, cost, owner opt-in.
- **Online payment / deposit** (v2).

## 7. MVP status

The MVP as described above (§2 "Included in the MVP") is implemented and covered by unit tests (Vitest) and end-to-end tests (Playwright, `e2e/`): multi-listing FR/EN properties, selectable availability calendar synced from Airbnb, booking request form with email notification, Strapi back-office (accept/refuse), technical SEO (sitemap, robots.txt, JSON-LD, canonical/hreflang), Docker for local dev, Helm chart for k3s deployment, GitHub Actions CI (lint/test/build/e2e/dependency audit). Still out of MVP scope: WhatsApp and online payment (v2, see §6).
