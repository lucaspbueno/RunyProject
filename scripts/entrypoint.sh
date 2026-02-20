#!/bin/sh

set -e

echo "============================================"
echo "  🚀  Iniciando aplicação Runy"
echo "============================================"

echo ""
echo "🧠 Gerando migrações do banco de dados..."
npm run db:generate

echo ""
echo "📦 Executando migrações do banco de dados..."
npm run db:migrate

echo ""
echo "🌱 Executando seed do banco de dados..."
npm run db:seed

echo ""
echo "▶️  Iniciando servidor Next.js..."
exec npm run dev
