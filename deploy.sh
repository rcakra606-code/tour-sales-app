#!/bin/bash
set -e
echo "Deploy helper: attempt docker-compose if exists"
if [ -f docker-compose.yml ]; then
  docker-compose down || true
  docker-compose up -d --build
  echo "Run migrations"
  docker-compose exec app npm run migrate || true
else
  echo "No docker-compose.yml found. Manual deploy required."
fi
