# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile --filter web...

FROM deps AS dev
ENV NODE_ENV=development
COPY apps/web apps/web
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["pnpm", "run", "dev"]

FROM deps AS build
ENV NODE_ENV=production
COPY apps/web apps/web
WORKDIR /app/apps/web
RUN pnpm run build

FROM build AS production
ENV NODE_ENV=production
EXPOSE 3000
CMD ["pnpm", "run", "start"]
