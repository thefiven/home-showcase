# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-07-19

First stable release: the MVP described in `SPEC.md` §2 is complete.

### Added

- Multi-property showcase website (Next.js, SSR/SSG), list and detail pages,
  fully bilingual FR/EN.
- Airbnb-style photo gallery with lightbox and cyclic navigation.
- Selectable availability calendar per property, synced from Airbnb via
  iCal export (Strapi cron job, `DTEND` treated as exclusive so the checkout
  day becomes bookable again).
- Booking request form: email notification to the owner (self-hosted SMTP
  via `@strapi/provider-email-nodemailer`), non-blocking send failure;
  automatic creation/removal of availability based on status
  (`pending`/`accepted`/`refused`).
- Strapi back-office with a dedicated role for the owner to edit all
  content without touching code.
- Location privacy: precise position never exposed publicly, approximate
  position derived on the CMS side.
- Technical SEO: sitemap, robots.txt, canonical URLs and FR/EN hreflang,
  JSON-LD structured data, styled 404 page consistent with the design
  system.
- Docker dev environment (Postgres, Strapi, Next.js via `docker-compose`)
  and Helm chart for k3s deployment.
- GitHub Actions CI: lint, tests, build, Playwright end-to-end tests,
  dependency audit.

[1.0.0]: https://github.com/thefiven/home-showcase/releases/tag/v1.0.0
