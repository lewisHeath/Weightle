FROM node:22-slim AS base
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_SITE_URL=https://weightle.app
ENV NEXT_PUBLIC_IMAGE_BASE_URL=https://cdn.weightle.app
ARG NEXT_PUBLIC_ADSENSE_CLIENT_ID
ARG NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR_LEFT
ARG NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR_RIGHT
ENV NEXT_PUBLIC_ADSENSE_CLIENT_ID=$NEXT_PUBLIC_ADSENSE_CLIENT_ID
ENV NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR_LEFT=$NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR_LEFT
ENV NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR_RIGHT=$NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR_RIGHT
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
