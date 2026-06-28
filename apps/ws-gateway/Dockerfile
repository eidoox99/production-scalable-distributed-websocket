FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

FROM base AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/ws-gateway ./apps/ws-gateway
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @pkg/shared build
RUN pnpm --filter @app/ws-gateway build
RUN pnpm deploy --filter @app/ws-gateway --prod /prod/ws-gateway

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /prod/ws-gateway .
EXPOSE 3001
CMD ["node", "dist/index.js"]
