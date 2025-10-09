#!/bin/bash
set -e
echo "🚀 Setup Tour Sales Management (full-stack)..."

if [ ! -f package.json ]; then
  echo "package.json missing - abort"
  exit 1
fi

echo "📦 npm install..."
npm install

echo "📁 Ensure directories"
mkdir -p logs uploads temp backups ssl public

echo "🔐 Generate SSL (node-forge)"
npm run generate-ssl || true

# fallback: openssl if missing
if [ ! -f ssl/private-key.pem ] || [ ! -f ssl/certificate.pem ]; then
  echo "⚠️ SSL not present - attempting openssl script"
  chmod +x scripts/setup-ssl.sh || true
  ./scripts/setup-ssl.sh || true
fi

echo "🗄 Run migrations (if any)"
npm run migrate || true

echo "🔒 Fix permissions"
chmod 600 ssl/private-key.pem || true
chmod 644 ssl/certificate.pem || true
chmod 755 logs uploads temp backups ssl || true

echo "✅ Setup complete. Edit .env.production then run: npm start"
