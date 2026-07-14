# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
RUN corepack enable
WORKDIR /app

# Stage d'installation uniquement : seul endroit qui a besoin du toolchain natif
# (python3/make/g++, requis pour compiler better-sqlite3 — fallback local hors
# Docker, issue #1). Isolé ici pour ne PAS se retrouver dans les images dev/production.
FROM base AS deps
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/cms/package.json apps/cms/package.json
RUN pnpm install --frozen-lockfile --filter cms...

FROM base AS dev
# wget : utilisé par le healthcheck docker-compose (endpoint /_health).
RUN apt-get update \
    && apt-get install -y --no-install-recommends wget \
    && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=development
COPY apps/cms apps/cms
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/cms/node_modules ./apps/cms/node_modules
WORKDIR /app/apps/cms
EXPOSE 1337
CMD ["pnpm", "run", "develop"]

FROM deps AS build
ENV NODE_ENV=production
COPY apps/cms apps/cms
WORKDIR /app/apps/cms
RUN pnpm run build

FROM base AS production
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/cms ./apps/cms
WORKDIR /app/apps/cms
EXPOSE 1337
CMD ["pnpm", "run", "start"]
