# Build from repo root so capta-config is available:
#   docker build -f capta-planner/Dockerfile .
# Or: docker compose -f capta-planner/docker-compose.yml build
FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy shared config and planner
COPY capta-config /app/capta-config
COPY capta-planner/package.json capta-planner/pnpm-lock.yaml /app/planner/
WORKDIR /app/planner
RUN pnpm install --frozen-lockfile

COPY capta-planner /app/planner/
RUN pnpm build

# Production image
FROM node:24-alpine AS runner
WORKDIR /app/planner
ENV NODE_ENV=production
ENV PLANNER_DATA_DIR=/data
ENV PORT=3333
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=base /app/planner/public ./public
COPY --from=base /app/planner/.next/standalone ./
COPY --from=base /app/planner/.next/static ./.next/static
USER nextjs
EXPOSE 3333
CMD ["node", "server.js"]
