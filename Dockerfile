# syntax=docker/dockerfile:1

# ── deps ──────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# ── builder ───────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# These are placeholder values required by Next.js at build time only.
# Real secrets are injected at runtime via k8s environment variables / secrets.
# hadolint ignore=DL3048,SC2046
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXTAUTH_SECRET=build-placeholder \
    NEXTAUTH_URL=http://localhost:3000 \
    LINEAR_CLIENT_ID=build-placeholder \
    LINEAR_CLIENT_SECRET=build-placeholder

RUN npm run build

# ── runner ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# standalone output + static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static    ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public          ./public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
