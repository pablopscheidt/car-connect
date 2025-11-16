FROM node:lts-alpine AS deps
WORKDIR /app
COPY package.json ./ 
COPY package-lock.json* ./ 
RUN corepack enable && npm i --frozen-lockfile || npm ci

FROM node:lts-alpine AS builder
WORKDIR /app
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:lts-alpine AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Script de entrypoint
COPY docker/api-entrypoint.sh /app/docker/api-entrypoint.sh
RUN chmod +x /app/docker/api-entrypoint.sh

# Pasta de uploads
RUN mkdir uploads

EXPOSE 4000
CMD ["sh", "/app/docker/api-entrypoint.sh"]
