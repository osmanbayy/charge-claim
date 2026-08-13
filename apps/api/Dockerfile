FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable \
  && corepack prepare pnpm@10.14.0 --activate

WORKDIR /app


FROM base AS dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN pnpm install --frozen-lockfile


FROM dependencies AS build

COPY apps/api apps/api

RUN pnpm --filter api build


FROM node:20-alpine AS production

ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable \
  && corepack prepare pnpm@10.14.0 --activate

WORKDIR /app

COPY --from=dependencies \
  --chown=node:node \
  /app/node_modules \
  ./node_modules

COPY --from=dependencies \
  --chown=node:node \
  /app/apps/api/node_modules \
  ./apps/api/node_modules

COPY --from=dependencies \
  --chown=node:node \
  /app/package.json \
  ./package.json

COPY --from=dependencies \
  --chown=node:node \
  /app/pnpm-workspace.yaml \
  ./pnpm-workspace.yaml

COPY --from=dependencies \
  --chown=node:node \
  /app/apps/api/package.json \
  ./apps/api/package.json

COPY --from=build \
  --chown=node:node \
  /app/apps/api/dist \
  ./apps/api/dist

COPY --from=build \
  --chown=node:node \
  /app/apps/api/src/core/database/postgres/drizzle/migrations \
  ./apps/api/dist/core/database/postgres/drizzle/migrations

USER node

EXPOSE 3001

CMD ["node", "apps/api/dist/main.js"]