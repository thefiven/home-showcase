# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
RUN corepack enable
WORKDIR /app
# Toolchain natif requis par better-sqlite3 (fallback local hors Docker, issue #1)
# au moment du `pnpm install`, même si ce conteneur utilise Postgres.
# wget : utilisé par le healthcheck docker-compose (endpoint /_health).
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ wget \
    && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/cms/package.json apps/cms/package.json
RUN pnpm install --frozen-lockfile --filter cms...

FROM deps AS dev
ENV NODE_ENV=development
COPY apps/cms apps/cms
WORKDIR /app/apps/cms
EXPOSE 1337
CMD ["pnpm", "run", "develop"]

FROM deps AS build
ENV NODE_ENV=production
COPY apps/cms apps/cms
WORKDIR /app/apps/cms
RUN pnpm run build

FROM build AS production
ENV NODE_ENV=production
EXPOSE 1337
CMD ["pnpm", "run", "start"]
