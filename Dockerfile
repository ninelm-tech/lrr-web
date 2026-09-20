# ─────────────────────────────────────────────────────────
# Stage 1 — Build
# ─────────────────────────────────────────────────────────
# NEXT_PUBLIC_* variables are inlined into the JS bundle at build time.
# They MUST be passed as --build-arg by GitHub Actions.
# Use separate staging and production builds with the correct values each time.
# ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

# ── Build-time variables (baked into the browser bundle) ──
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ARG NEXT_PUBLIC_SENTRY_DSN

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN

# Sentry auth token for source map upload during build (not exposed to browser)
ARG SENTRY_AUTH_TOKEN
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN

RUN yarn build

# ─────────────────────────────────────────────────────────
# Stage 2 — Runtime
# ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# NODE_ENV=production — keeps Next.js in optimised mode for both staging and prod.
# Runtime secrets (SENTRY_DSN, SENTRY_ENVIRONMENT etc.) are injected by ECS.
ENV NODE_ENV=production

COPY --from=builder /app/public              ./public
COPY --from=builder /app/.next/standalone    ./
COPY --from=builder /app/.next/static        ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
