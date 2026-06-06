#!/bin/bash

set -e

cd /home/deploy/app/app

echo "📥 Fetching latest code..."
#git fetch origin
git fetch origin staging

echo "🔄 Resetting to staging..."
git checkout staging
git reset --hard origin/staging
#git clean -fd for .env remove

echo "🧹 Removing unused containers..."
#docker-compose down

echo "npm install all dependencies"
cd /home/deploy/app/app/backend/monolithic
npm i
cd /home/deploy/app/app/frontend
npm i
cd /home/deploy/app/app

echo "🔨 Rebuilding and starting containers..."
#docker-compose up -d --build --force-recreate
docker-compose up -d --build --remove-orphans

echo "✅ Deployment done"
