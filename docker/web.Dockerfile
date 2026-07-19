# syntax=docker/dockerfile:1

FROM node:26-bookworm-slim AS base
# node:26 dropped corepack from the base image (Node 25+); install it
# explicitly before enabling it.
RUN npm install -g corepack@latest && corepack enable
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
# NEXT_PUBLIC_* est inliné dans le bundle client par `next build` — doit donc
# être fourni comme build arg (pas seulement comme env de conteneur au runtime).
ARG NEXT_PUBLIC_STRAPI_URL
ENV NEXT_PUBLIC_STRAPI_URL=$NEXT_PUBLIC_STRAPI_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NODE_ENV=production
COPY apps/web apps/web
WORKDIR /app/apps/web
RUN pnpm run build

FROM build AS production
ENV NODE_ENV=production
EXPOSE 3000
CMD ["pnpm", "run", "start"]
