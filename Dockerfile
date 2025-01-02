# ---------------------
# Stage 1: Builder
# ---------------------
FROM node:20-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_VERSION
ENV NEXT_PUBLIC_VERSION=$NEXT_PUBLIC_VERSION

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# ---------------------
# Stage 2: Production
# ---------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

ARG NEXT_PUBLIC_VERSION
ENV NEXT_PUBLIC_VERSION=$NEXT_PUBLIC_VERSION

# Copy only package files and install *production dependencies*
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

# Copy Next.js build output
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Copy any runtime files or folders your app needs (validateEnv.js, src/lib/env, etc.)
COPY --from=builder /app/validateEnv.js ./validateEnv.js
COPY --from=builder /app/src ./src
# If you only need specific files inside src, you can copy them individually
# COPY --from=builder /app/src/lib/env.js ./src/lib/env.js

EXPOSE 3000
CMD ["npm", "start"]

