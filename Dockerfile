# ===============================
# Stage 1: Build
# ===============================
FROM node:20-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_VERSION
ENV NEXT_PUBLIC_VERSION=$NEXT_PUBLIC_VERSION
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# ===============================
# Stage 2: Runtime
# ===============================
FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=builder /app /app

RUN npm ci --omit=dev \
 && npm cache clean --force

EXPOSE 3000
CMD ["npm", "start"]
