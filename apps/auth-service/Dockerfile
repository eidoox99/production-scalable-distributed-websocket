FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

FROM base AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/auth-service ./apps/auth-service
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @pkg/shared build
RUN pnpm --filter @app/auth-service build
RUN pnpm deploy --filter @app/auth-service --prod /prod/auth-service

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /prod/auth-service .
EXPOSE 4005
CMD ["node", "dist/index.js"]
