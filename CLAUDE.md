# CLAUDE.md

Conventions for the **home-showcase** project. See `SPEC.md` for product scoping and detailed decisions.

## Project summary

**Ar Mor** — an Airbnb-style multi-property showcase website (a complement to Airbnb, not a replacement): property listings, availability calendar synced from Airbnb (iCal, read-only), booking requests with email notification to the owner, a back-office to edit content without touching code.

The MVP (see `SPEC.md` §2 and §7) is implemented: FR/EN properties, selectable calendar, booking request form, email notifications, back-office, technical SEO, Docker, Helm/k3s, CI.

## Tech stack

- **Frontend**: Next.js (TypeScript), SSR/SSG. Multilingual FR/EN from the MVP.
- **CMS**: Strapi, self-hosted. Also serves as the backend for booking requests and availability (no separate database/backend on the web side).
- **Database**: PostgreSQL (used by Strapi) — target and reference environment, started via `docker/docker-compose.yml` (issue #2). SQLite in `apps/cms` (issue #1) remains available as a practical fallback for local dev outside Docker, but isn't guaranteed to be at parity with Postgres (no CI on it): any Postgres-specific feature (JSON, raw SQL...) takes precedence over SQLite compatibility.
- **Package manager**: `pnpm` (workspaces for the monorepo).
- **Containerization**: Docker + docker-compose for local development (Next.js, Strapi, Postgres) — see `README.md` (`pnpm docker:up`).
- **Target hosting**: homelab k3s (upcoming) — avoid any dependency on a non-portable proprietary PaaS. Helm manifests in `deploy/helm/home-showcase/` (see `deploy/README.md`).
- **Email notification**: self-hosted SMTP via `@strapi/provider-email-nodemailer` (see `SPEC.md` §5), isolated in `apps/cms/src/notifications`. A send failure is logged, never blocking for request creation.
- **WhatsApp**: out of MVP scope, planned for v2.

## Folder structure

```
home-showcase/
├── apps/
│   ├── web/          # Next.js — public showcase site (FR/EN)
│   └── cms/          # Strapi — back-office, API, content-types, cron jobs (iCal sync), notifications
├── docker/            # Dockerfiles and docker-compose for local dev
├── deploy/            # Helm manifests for k3s deployment (deploy/helm/home-showcase/)
├── e2e/                # Playwright end-to-end tests
├── SPEC.md            # Product scoping and decisions
├── CLAUDE.md          # This file
└── README.md
```

Strapi content model (`apps/cms`): `Property` (exact location never exposed publicly — an approximate position is derived via the Document Service middleware), `Availability` (populated by the `src/cron-tasks` cron job + `src/api/availability/services/ical.ts` service, read-only in the admin), `BookingRequest` (status `pending`/`accepted`/`refused`; creation triggers the email notification, a status change creates/removes the corresponding `Availability`).

## Testing strategy

- **Vitest** for targeted unit and integration tests.
- Prioritize critical business logic: availability computation/merging, iCal parsing and sync, booking request status workflow (`pending`/`accepted`/`refused`), Strapi API endpoints.
- **Playwright** for end-to-end tests, in `e2e/` (dedicated pnpm workspace): critical flows (availability, booking request, form validation, admin status). See `e2e/run.sh` to run the disposable stack locally/in CI.
- Don't test what belongs to the framework itself (default Next.js rendering, standard Strapi admin) — focus on business code specific to this project.
- Vitest is configured in `apps/web` and `apps/cms` (`pnpm run test` at the root, `--passWithNoTests` as long as no business logic exists yet): this is the foundation laid from the monorepo's start (issue #1), to be filled in as issues introduce real logic (e.g. iCal sync, booking workflow).

## Design System

Follow the DESIGN.md tokens for any UI work.

- Use color tokens exactly as specified
- Apply the typographic scale consistently
- Respect the defined responsive breakpoints
- Don't introduce a new color, font, or spacing value without an explicit reason

## Git Workflow

Solo project, but with a clean history and a systematic PR before merging into `main`.

### Branches

- `main`: always deployable, protected (never commit directly to it).
- One branch per feature/fix, prefixed by type: `feat/...`, `fix/...`, `chore/...`, `refactor/...`, `docs/...`, `test/...`.
  - Examples: `feat/booking-request-form`, `fix/ical-sync-timezone`.

### Commits — gitmoji convention

Every commit starts with a gitmoji matching its nature. Convention already established in this repo (`🎉` for the initial commit). Emojis to use:

| Emoji | Usage                                                   |
| ----- | ------------------------------------------------------- |
| 🎉    | Initial commit / project kickoff                        |
| ✨    | New feature                                             |
| 🐛    | Bug fix                                                 |
| ♻️    | Refactoring (no behavior change)                        |
| 💄    | Style / UI / CSS                                        |
| ✅    | Adding or fixing tests                                  |
| 📝    | Documentation                                           |
| 🔧    | Configuration (tooling, env, CI)                        |
| ⚡️    | Performance improvement                                 |
| 📦    | Dependencies / build                                    |
| 👷    | CI/CD                                                   |
| 🚧    | Work in progress, intermediate commit (avoid on `main`) |
| ⏪    | Revert                                                  |
| 🔒    | Security                                                |
| 🌐    | Internationalization (FR/EN)                            |

Format: `<gitmoji> <short imperative summary>` (e.g. `✨ Add the booking request form`).

### Pull Requests — via GitHub MCP

The PR workflow goes through the GitHub MCP tools (`mcp__github__*`), not manual `gh` commands, when Claude Code is involved:

1. Create the branch (`mcp__github__create_branch`) from `main`.
2. Commit the changes on the branch (gitmoji commits as above).
3. Open the PR (`mcp__github__create_pull_request`) with a clear summary of the change and, if relevant, a test plan.
4. For a review with comments on specific lines: `pull_request_review_write` (create) → `add_comment_to_pending_review` → `pull_request_review_write` (submit_pending).
5. Merge (`mcp__github__merge_pull_request`) only after explicit user confirmation — never merge automatically without confirmation.

No force-push to `main`, no automated interactive rebase.
