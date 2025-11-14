#!/bin/sh
set -e

echo "📦 Rodando migrations..."
npx prisma migrate deploy

echo "🚀 Subindo API..."
node dist/main.js
