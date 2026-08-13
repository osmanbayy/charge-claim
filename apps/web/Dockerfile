FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app


FROM base AS dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN pnpm install --frozen-lockfile


FROM dependencies AS build

ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

COPY apps/web apps/web

RUN pnpm --filter web build


FROM node:20-alpine AS production

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=build \
  --chown=nextjs:nodejs \
  /app/apps/web/.next/standalone ./

COPY --from=build \
  --chown=nextjs:nodejs \
  /app/apps/web/.next/static \
  ./apps/web/.next/static

COPY --from=build \
  --chown=nextjs:nodejs \
  /app/apps/web/public \
  ./apps/web/public

USER nextjs

EXPOSE 3000

CMD ["node", "apps/web/server.js"]