FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./ 
COPY package-lock.json* ./ 
COPY .npmrc* ./ 
RUN corepack enable && pnpm i --frozen-lockfile || npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Script de entrypoint
COPY docker/api-entrypoint.sh /app/docker/api-entrypoint.sh
RUN chmod +x /app/docker/api-entrypoint.sh

# Pasta de uploads
RUN mkdir -p /app/uploads

EXPOSE 3001
CMD ["sh", "/app/docker/api-entrypoint.sh"]
