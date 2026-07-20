# Ar Mor

Airbnb-style multi-property showcase website (`home-showcase` repo). See `SPEC.md` (product scoping) and `CLAUDE.md` (project conventions).

## Development with Docker

Starts Postgres, Strapi (`apps/cms`), and Next.js (`apps/web`) with a single command.

```sh
cp docker/.env.example docker/.env
# edit docker/.env: fill in real values for the Strapi secrets
# (APP_KEYS, API_TOKEN_SALT, ADMIN_JWT_SECRET, TRANSFER_TOKEN_SALT, JWT_SECRET,
# ENCRYPTION_KEY — see the file's comments), e.g. via `openssl rand -base64 32`

pnpm docker:up    # starts the 3 services (builds on first run)
pnpm docker:down  # stops the services (Postgres data is preserved in the volume)
```

- Next.js: http://localhost:3000
- Strapi (admin): http://localhost:1337/admin

`apps/web` and `apps/cms` are mounted into their respective containers: code
changes are picked up live (Next.js / Strapi hot-reload), without rebuilding
the image. A rebuild (`pnpm docker:up`, which always reruns `--build`) is
only needed after a dependency change (`package.json`) or a Dockerfile change.

See `docker/docker-compose.yml` for service details.

## Dev tooling

```sh
pnpm lint          # ESLint (apps/web + apps/cms)
pnpm format        # Prettier --write across the repo
pnpm format:check  # Prettier --check (used in pre-commit and CI)
pnpm test          # Vitest (apps/web + apps/cms)
pnpm build         # production build of both apps
```

`pnpm install` automatically enables a **pre-commit** hook (via
[Lefthook](https://lefthook.dev)) that runs `format:check` + `lint` + `test`
before each commit. GitHub Actions CI (`.github/workflows/ci.yml`) reruns
the same steps + the build on every pull request targeting `main`.

## E2E tests

Critical flows (booking request, accept/refuse from the admin) are covered
by Playwright (`e2e/`), on a dedicated Strapi/Next.js stack with a disposable
SQLite database (see `e2e/.env.example` for the available variables):

```sh
pnpm --filter e2e exec playwright install --with-deps chromium  # once
pnpm --filter e2e test:e2e:orchestrated
```

`e2e/run.sh` starts Strapi and Next.js, waits for them to be ready, runs
Playwright (which creates its own admin + test property via global-setup),
then stops both servers. No dependency on Postgres or Docker for this lane.
CI (the `e2e` job) runs the same script.

### Branch protection on `main`

The repo is public, which allows branch protection without a paid plan.
Configured on `main`:

- Pull request required before merging (0 approvals required — solo project).
- CI status (`ci`) required and up to date before merging.
- No direct pushes to `main`, including for admins.
- No force-push, no branch deletion.
